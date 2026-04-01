using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StreamHub.Application.DTOs.Chat;
using StreamHub.Application.Interfaces;

namespace StreamHub.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _logger = logger;
    }

    [HttpGet("stream/{streamId}")]
    public async Task<ActionResult<IEnumerable<ChatMessageDto>>> GetStreamMessages(int streamId)
    {
        try
        {
            var messages = await _chatService.GetStreamMessagesAsync(streamId);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get messages for stream {StreamId}", streamId);
            return StatusCode(500, new { message = "Failed to retrieve messages" });
        }
    }
}