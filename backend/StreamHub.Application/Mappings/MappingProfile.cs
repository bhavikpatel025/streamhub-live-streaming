using AutoMapper;
using StreamHub.Domain.Entities;
using StreamHub.Application.DTOs.Stream;
using StreamHub.Application.DTOs.Chat;
using Stream = StreamHub.Domain.Entities.Stream;

namespace StreamHub.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Stream mappings
        CreateMap<Stream, StreamDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username));

        CreateMap<Stream, StreamListDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username));

        CreateMap<CreateStreamDto, Stream>();

        // Chat mappings
        CreateMap<ChatMessage, ChatMessageDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username));
    }
}