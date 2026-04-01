using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StreamHub.Application.DTOs.Chat;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(IChatService chatService, ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    public async Task JoinChat(int streamId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat_{streamId}");

        var messages = await _chatService.GetStreamMessagesAsync(streamId);
        await Clients.Caller.SendAsync("LoadMessages", messages);
    }

    // Backward-compatible alias for older clients.
    public Task JoinStream(int streamId) => JoinChat(streamId);

    public async Task LeaveChat(int streamId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat_{streamId}");
    }

    // Backward-compatible alias for older clients.
    public Task LeaveStream(int streamId) => LeaveChat(streamId);

    public async Task SendMessage(int streamId, string message)
    {
        try
        {
            if (streamId <= 0)
            {
                throw new HubException("Invalid stream id.");
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                throw new HubException("Message cannot be empty.");
            }

            var userId = GetUserId();
            var messageDto = await _chatService.SendMessageAsync(userId, new SendMessageDto
            {
                StreamId = streamId,
                Message = message.Trim()
            });

            await Clients.Group($"chat_{streamId}").SendAsync("ReceiveMessage", messageDto);
        }
        catch (HubException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send chat message for stream {StreamId}", streamId);
            throw new HubException("Failed to send message.");
        }
    }

    private int GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            throw new HubException("User not authenticated.");
        }

        return int.Parse(userIdClaim.Value);
    }
}
