using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StreamHub.Application.DTOs.Stream;
using StreamHub.Application.Interfaces;
using System.Security.Claims;

namespace StreamHub.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamsController : ControllerBase
{
    private readonly IStreamService _streamService;
    private readonly IStreamReactionService _streamReactionService;
    private readonly INotificationService _notificationService;
    private readonly IHubContext<StreamHub.API.Hubs.StreamHub> _hubContext;

    public StreamsController(
        IStreamService streamService,
        IStreamReactionService streamReactionService,
        INotificationService notificationService,
        IHubContext<StreamHub.API.Hubs.StreamHub> hubContext)
    {
        _streamService = streamService;
        _streamReactionService = streamReactionService;
        _notificationService = notificationService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StreamListDto>>> GetLiveStreams()
    {
        var streams = await _streamService.GetLiveStreamsAsync();
        return Ok(streams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StreamDto>> GetStreamById(int id)
    {
        var stream = await _streamService.GetStreamByIdAsync(id);
        if (stream == null)
        {
            return NotFound(new { message = "Stream not found" });
        }
        return Ok(stream);
    }

    [HttpGet("{id}/stats")]
    public async Task<ActionResult<StreamStatsDto>> GetStreamStats(int id)
    {
        var stream = await _streamService.GetStreamByIdAsync(id);
        if (stream == null)
        {
            return NotFound(new { message = "Stream not found" });
        }

        var userId = 0;
        if (User.Identity?.IsAuthenticated == true)
        {
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
        }

        var reactions = await _streamReactionService.GetStreamReactionsAsync(id, userId);

        return Ok(new StreamStatsDto
        {
            Viewers = stream.ViewerCount,
            Likes = reactions.Likes,
            Dislikes = reactions.Dislikes
        });
    }

    [Authorize]
    [HttpGet("my-streams")]
    public async Task<ActionResult<IEnumerable<StreamDto>>> GetMyStreams()
    {
        var userId = GetUserId();
        var streams = await _streamService.GetUserStreamsAsync(userId);
        return Ok(streams);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<StreamDto>> CreateStream([FromBody] CreateStreamDto dto)
    {
        try
        {
            var userId = GetUserId();
            var stream = await _streamService.CreateStreamAsync(userId, dto);
            return CreatedAtAction(nameof(GetStreamById), new { id = stream.Id }, stream);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{id}/stream-key")]
    public async Task<ActionResult<StreamKeyDto>> GetStreamKey(int id)
    {
        try
        {
            var userId = GetUserId();
            var streamKey = await _streamService.GetStreamKeyAsync(id, userId);
            return Ok(streamKey);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}/start")]
    public async Task<IActionResult> StartStream(int id)
    {
        try
        {
            var userId = GetUserId();
            await _streamService.StartStreamAsync(id, userId);

            var stream = await _streamService.GetStreamByIdAsync(id);
            if (stream != null)
            {
                var notifications = await _notificationService.CreateStreamStartedNotificationsAsync(
                    userId,
                    stream.Id,
                    stream.Username,
                    stream.Title);

                foreach (var notification in notifications)
                {
                    await _hubContext.Clients
                        .Group(StreamHub.API.Hubs.StreamHub.GetUserGroupName(notification.UserId))
                        .SendAsync("StreamStartedNotification", notification.Notification);
                }
            }

            return Ok(new { message = "Stream started successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("{id}/stop")]
    public async Task<IActionResult> StopStream(int id)
    {
        try
        {
            var userId = GetUserId();
            await _streamService.StopStreamAsync(id, userId);
            return Ok(new { message = "Stream stopped successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStream(int id)
    {
        try
        {
            var userId = GetUserId();
            await _streamService.DeleteStreamAsync(id, userId);
            return Ok(new { message = "Stream deleted successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
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
