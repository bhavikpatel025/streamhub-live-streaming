using AutoMapper;
using StreamHub.Application.DTOs.Chat;
using StreamHub.Application.Interfaces;
using StreamHub.Domain.Entities;

namespace StreamHub.Application.Services;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;
    private readonly IMapper _mapper;

    public ChatService(IChatRepository chatRepository, IMapper mapper)
    {
        _chatRepository = chatRepository;
        _mapper = mapper;
    }

    public async Task<ChatMessageDto> SendMessageAsync(int userId, SendMessageDto dto)
    {
        var message = new ChatMessage
        {
            StreamId = dto.StreamId,
            UserId = userId,
            Message = dto.Message,
            SentAt = DateTime.UtcNow
        };

        var createdMessage = await _chatRepository.CreateAsync(message);
        return _mapper.Map<ChatMessageDto>(createdMessage);
    }

    public async Task<IEnumerable<ChatMessageDto>> GetStreamMessagesAsync(int streamId)
    {
        var messages = await _chatRepository.GetStreamMessagesAsync(streamId);
        return _mapper.Map<IEnumerable<ChatMessageDto>>(messages);
    }
}