using Contracts;
using JasperFx.Events;
using Marten;
using Marten.Events.Projections;
using StatsService.Models;

namespace StatsService.Projections;

public partial class TopUsersProjection : EventProjection
{
    public override async ValueTask ApplyAsync(IDocumentOperations operations, IEvent e, CancellationToken cancellation)
    {
        if (e.Data is not UserReputationChanged data)
            return;

        var day = DateOnly.FromDateTime(e.Timestamp.UtcDateTime);

        var id = $"{data.UserId}:{day:yyyy-MM-dd}";

        var doc = await operations.LoadAsync<UserDailyReputation>(id, cancellation)
                  ?? new UserDailyReputation { Id = id, UserId = data.UserId, Date = day, Delta = 0 };

        doc.Delta += data.Delta;
        operations.Store(doc);
    }
}