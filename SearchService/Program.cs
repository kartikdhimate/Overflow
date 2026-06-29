using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using SearchService.Data;
using SearchService.Models;
using System.Text.RegularExpressions;
using JasperFx.CodeGeneration;
using JasperFx.CodeGeneration.Model;
using Typesense;
using Typesense.Setup;
using Wolverine;
using Wolverine.RabbitMQ;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.AddServiceDefaults();

var typesenseUri = builder.Configuration["services:typesense:typesense:0"];

if (string.IsNullOrWhiteSpace(typesenseUri))
    throw new InvalidOperationException("Typesense URI not found in config");

var typesenseApiKey = builder.Configuration["typesense-api-key"];
if (string.IsNullOrWhiteSpace(typesenseApiKey))
    throw new InvalidOperationException("Typesense API key not found in config");

var uri = new Uri(typesenseUri);
builder.Services.AddTypesenseClient(config =>
{
    config.ApiKey = typesenseApiKey;
    config.Nodes = new List<Node> {
    new(uri.Host, uri.Port.ToString(), uri.Scheme)
    };
});

builder.Services.AddOpenTelemetry().WithTracing(traceProviderBuilder =>
{
    traceProviderBuilder
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(builder.Environment.ApplicationName))
        .AddSource("Wolverine");
});

builder.Host.UseWolverine(opts =>
{
    opts.UseRabbitMqUsingNamedConnection("messaging").AutoProvision();
    opts.ListenToRabbitQueue("questions.search", cfg =>
    {
        cfg.BindExchange("questions");
    });
    opts.UseRuntimeCompilation();
    opts.ServiceLocationPolicy = ServiceLocationPolicy.AllowedButWarn;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapDefaultEndpoints();

app.MapGet("/search", async (string query, ITypesenseClient client) =>
{
    //query: [tag]something
    string? tag = null;
    var tagMatch = Regex.Match(query, @"\[(.*?)\]");

    if (tagMatch.Success)
    {
        tag = tagMatch.Groups[1].Value;
        query = query.Replace(tagMatch.Value, "").Trim();
    }

    var searchParams = new SearchParameters(query, "title,content");
    if (!string.IsNullOrWhiteSpace(tag))
    {
        searchParams.FilterBy = $"tags:=[{tag}]";
    }

    try
    {
        var results = await client.Search<SearchQuestion>("questions", searchParams);
        return Results.Ok(results.Hits.Select(hit => hit.Document));
    }
    catch (Exception exception)
    {
        return Results.Problem("Typesense search failed", exception.Message);
    }
});

app.MapGet("/search/similar-title", async (string query, ITypesenseClient client) =>
{
    var searchParams = new SearchParameters(query, "title");
    try
    {
        var results = await client.Search<SearchQuestion>("questions", searchParams);
        return Results.Ok(results.Hits.Select(hit => hit.Document));
    }
    catch (Exception exception)
    {
        return Results.Problem("Typesense search failed", exception.Message);
    }
});

using var scope = app.Services.CreateScope();
var client = scope.ServiceProvider.GetRequiredService<ITypesenseClient>();
await SearchInitializer.EnsureIndexExists(client);

app.Run();
