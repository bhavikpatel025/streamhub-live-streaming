using AutoMapper;
using Microsoft.Extensions.Configuration;
using StreamHub.Application.DTOs.Stream;
using StreamHub.Application.Interfaces;
using Stream = StreamHub.Domain.Entities.Stream;

namespace StreamHub.Application.Services;

public class StreamService : IStreamService
{
    private readonly IStreamRepository _streamRepository;
    private readonly IMapper _mapper;
    private readonly string _rtmpUrl;

    public StreamService(IStreamRepository streamRepository, IMapper mapper, IConfiguration configuration)
    {
        _streamRepository = streamRepository;
        _mapper = mapper;
        _rtmpUrl = configuration["StreamSettings:RtmpUrl"] ?? "rtmp://localhost/live";
    }

    public async Task<StreamDto> CreateStreamAsync(int userId, CreateStreamDto dto)
    {
        var stream = new Stream
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            StreamKey = GenerateStreamKey(),
            IsLive = false,
            ViewerCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        var createdStream = await _streamRepository.CreateAsync(stream);
        return _mapper.Map<StreamDto>(createdStream);
    }

    public async Task<StreamDto?> GetStreamByIdAsync(int id)
    {
        var stream = await _streamRepository.GetByIdAsync(id);
        return stream == null ? null : _mapper.Map<StreamDto>(stream);
    }

    public async Task<StreamDto?> GetStreamByKeyAsync(string streamKey)
    {
        var stream = await _streamRepository.GetByStreamKeyAsync(streamKey);
        return stream == null ? null : _mapper.Map<StreamDto>(stream);
    }

    public async Task<IEnumerable<StreamListDto>> GetLiveStreamsAsync()
    {
        var streams = await _streamRepository.GetAllLiveStreamsAsync();
        return _mapper.Map<IEnumerable<StreamListDto>>(streams);
    }

    public async Task<IEnumerable<StreamDto>> GetUserStreamsAsync(int userId)
    {
        var streams = await _streamRepository.GetUserStreamsAsync(userId);
        return _mapper.Map<IEnumerable<StreamDto>>(streams);
    }

    public async Task<StreamKeyDto> GetStreamKeyAsync(int streamId, int userId)
    {
        var stream = await _streamRepository.GetByIdAsync(streamId);

        if (stream == null)
        {
            throw new Exception("Stream not found");
        }

        if (stream.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have access to this stream");
        }

        return new StreamKeyDto
        {
            StreamKey = stream.StreamKey,
            RtmpUrl = _rtmpUrl
        };
    }

    public async Task StartStreamAsync(int streamId, int userId)
    {
        var stream = await _streamRepository.GetByIdAsync(streamId);

        if (stream == null)
        {
            throw new Exception("Stream not found");
        }

        if (stream.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have access to this stream");
        }

        stream.IsLive = true;
        stream.StartedAt = DateTime.UtcNow;
        stream.ViewerCount = 0;

        await _streamRepository.UpdateAsync(stream);
    }

    public async Task StopStreamAsync(int streamId, int userId)
    {
        var stream = await _streamRepository.GetByIdAsync(streamId);

        if (stream == null)
        {
            throw new Exception("Stream not found");
        }

        if (stream.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have access to this stream");
        }

        stream.IsLive = false;
        stream.EndedAt = DateTime.UtcNow;
        stream.ViewerCount = 0;

        await _streamRepository.UpdateAsync(stream);
    }

    public async Task UpdateViewerCountAsync(int streamId, int count)
    {
        var stream = await _streamRepository.GetByIdAsync(streamId);

        if (stream == null)
        {
            throw new Exception("Stream not found");
        }

        stream.ViewerCount = count;
        await _streamRepository.UpdateAsync(stream);
    }

    public async Task DeleteStreamAsync(int streamId, int userId)
    {
        var stream = await _streamRepository.GetByIdAsync(streamId);

        if (stream == null)
        {
            throw new Exception("Stream not found");
        }

        if (stream.UserId != userId)
        {
            throw new UnauthorizedAccessException("You don't have access to this stream");
        }

        await _streamRepository.DeleteAsync(streamId);
    }

    private string GenerateStreamKey()
    {
        return Guid.NewGuid().ToString("N") + DateTime.UtcNow.Ticks.ToString("x");
    }
}
