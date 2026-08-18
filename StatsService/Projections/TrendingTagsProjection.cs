using Contracts;
using JasperFx.Events;
using Marten;
using Marten.Events.Projections;
using StatsService.Models;

namespace StatsService.Projections;

public partial class TrendingTagsProjection : EventProjection
{
    public override async ValueTask ApplyAsync(IDocumentOperations operations, IEvent e, CancellationToken cancellation)
    {
        if (e.Data is not QuestionCreated ev)
            return;

        var day = DateOnly.FromDateTime(DateTime.SpecifyKind(ev.Created, DateTimeKind.Utc));

        foreach (var tag in ev.Tags)
        {
            var id = $"{tag}:{day:yyyy-MM-dd}";
            var doc = await operations.LoadAsync<TagDailyUsage>(id, cancellation)
                      ?? new TagDailyUsage { Id = id, Tag = tag, Date = day, Count = 0 };

            doc.Count += 1;
            operations.Store(doc);
        }
    }
}
