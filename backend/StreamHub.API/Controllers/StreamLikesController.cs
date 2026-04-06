using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Controllers;

[ApiController]
[Route("api/streams/{streamId}")]
[Authorize]
public class StreamLikesController : ControllerBase
{
    private readonly IStreamLikeService _streamLikeService;
    private readonly IHubContext<Hubs.StreamHub> _hubContext;

    public StreamLikesController(
        IStreamLikeService streamLikeService,
        IHubContext<Hubs.StreamHub> hubContext)
    {
        _streamLikeService = streamLikeService;
        _hubContext = hubContext;
    }

    [HttpPost("toggle-like")]
    public async Task<IActionResult> ToggleLike(int streamId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _streamLikeService.ToggleLikeAsync(streamId, userId);

            // Broadcast updated like count to all viewers in the stream group
            await _hubContext.Clients
                .Group($"stream_{streamId}")
                .SendAsync("ReceiveLikeUpdate", result.TotalLikes);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("likes")]
    public async Task<IActionResult> GetLikes(int streamId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _streamLikeService.GetStreamLikesAsync(streamId, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return int.Parse(userIdClaim.Value);
    }
}
