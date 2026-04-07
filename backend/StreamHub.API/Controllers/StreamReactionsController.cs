using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StreamHub.API.Hubs;
using StreamHub.Application.DTOs.StreamReaction;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Controllers;

[ApiController]
[Route("api/streams/{streamId}/reaction")]
public class StreamReactionsController : ControllerBase
{
    private readonly IStreamReactionService _reactionService;
    private readonly IHubContext<StreamHub.API.Hubs.StreamHub> _hubContext;

    public StreamReactionsController(
        IStreamReactionService reactionService,
        IHubContext<StreamHub.API.Hubs.StreamHub> hubContext)
    {
        _reactionService = reactionService;
        _hubContext = hubContext;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> ToggleReaction(int streamId, [FromBody] ReactionRequestDto request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (request.ReactionType != "LIKE" && request.ReactionType != "DISLIKE")
        {
            return BadRequest("Invalid ReactionType. Expected LIKE or DISLIKE.");
        }

        var result = await _reactionService.ToggleReactionAsync(streamId, userId, request.ReactionType);

        // Broadcast the update to all clients in the stream room
        await _hubContext.Clients.Group($"stream_{streamId}")
            .SendAsync("ReactionUpdated", new { streamId, likes = result.Likes, dislikes = result.Dislikes });

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetReactions(int streamId)
    {
        int userId = 0;
        if (User.Identity?.IsAuthenticated == true)
        {
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
        }

        var result = await _reactionService.GetStreamReactionsAsync(streamId, userId);
        return Ok(result);
    }
}
