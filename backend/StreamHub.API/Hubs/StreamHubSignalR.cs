using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StreamHub.Application.Interfaces;
using System.Collections.Concurrent;

namespace StreamHub.API.Hubs;

[Authorize]
public class StreamHub : Hub
{
    private static readonly ConcurrentDictionary<int, ConcurrentDictionary<string, byte>> StreamViewers = new();

    private readonly IStreamService _streamService;
    private readonly ILogger<StreamHub> _logger;

    public StreamHub(IStreamService streamService, ILogger<StreamHub> logger)
    {
        _streamService = streamService;
        _logger = logger;
    }

    public async Task JoinStream(int streamId)
    {
        if (streamId <= 0)
        {
            throw new HubException("Invalid stream id.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(streamId));

        var viewers = StreamViewers.GetOrAdd(streamId, _ => new ConcurrentDictionary<string, byte>());
        viewers[Context.ConnectionId] = 0;

        await BroadcastViewerCountAsync(streamId);
    }

    public async Task LeaveStream(int streamId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(streamId));
        RemoveViewer(streamId, Context.ConnectionId);
        await BroadcastViewerCountAsync(streamId);
    }

    public Task NotifyStreamStarted(int streamId)
    {
        return Clients.All.SendAsync("StreamStarted", streamId);
    }

    public Task NotifyStreamEnded(int streamId)
    {
        return Clients.Group(GetGroupName(streamId)).SendAsync("StreamEnded", streamId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var impactedStreams = new List<int>();

        foreach (var streamId in StreamViewers.Keys)
        {
            if (RemoveViewer(streamId, Context.ConnectionId))
            {
                impactedStreams.Add(streamId);
            }
        }

        foreach (var streamId in impactedStreams)
        {
            await BroadcastViewerCountAsync(streamId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task BroadcastViewerCountAsync(int streamId)
    {
        try
        {
            var viewerCount = GetViewerCount(streamId);
            await _streamService.UpdateViewerCountAsync(streamId, viewerCount);

            await Clients.Group(GetGroupName(streamId))
                .SendAsync("ViewerCountUpdated", new { streamId, viewers = viewerCount });

            await Clients.All.SendAsync("GlobalViewerCountUpdated", new { streamId, viewers = viewerCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast viewer count for stream {StreamId}", streamId);
            throw new HubException("Failed to update viewer count.");
        }
    }

    private static string GetGroupName(int streamId) => $"stream_{streamId}";

    private static int GetViewerCount(int streamId)
    {
        return StreamViewers.TryGetValue(streamId, out var viewers) ? viewers.Count : 0;
    }

    private static bool RemoveViewer(int streamId, string connectionId)
    {
        if (!StreamViewers.TryGetValue(streamId, out var viewers))
        {
            return false;
        }

        var removed = viewers.TryRemove(connectionId, out _);
        if (removed && viewers.IsEmpty)
        {
            StreamViewers.TryRemove(streamId, out _);
        }

        return removed;
    }
}
