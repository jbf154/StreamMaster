﻿using FluentValidation;

using StreamMasterApplication.VideoStreams.Events;

using StreamMasterDomain.Pagination;

namespace StreamMasterApplication.VideoStreams.Commands;

public record UpdateAllVideoStreamsFromParametersRequest(VideoStreamParameters Parameters, UpdateVideoStreamRequest Request, List<int>? ChannelGroupIds) : IRequest<List<VideoStreamDto>> { }

public class UpdateAllVideoStreamsFromParametersRequestValidator : AbstractValidator<UpdateAllVideoStreamsFromParametersRequest>
{
    public UpdateAllVideoStreamsFromParametersRequestValidator()
    {
        _ = RuleFor(v => v.Parameters).NotNull().NotEmpty();
    }
}

[LogExecutionTimeAspect]
public class UpdateAllVideoStreamsFromParametersRequestHandler(ILogger<UpdateAllVideoStreamsFromParametersRequest> logger, IRepositoryWrapper repository, IMapper mapper, ISettingsService settingsService, IPublisher publisher, ISender sender, IHubContext<StreamMasterHub, IStreamMasterHub> hubContext, IMemoryCache memoryCache) : BaseMediatorRequestHandler(logger, repository, mapper, settingsService, publisher, sender, hubContext, memoryCache), IRequestHandler<UpdateAllVideoStreamsFromParametersRequest, List<VideoStreamDto>>
{
    public async Task<List<VideoStreamDto>> Handle(UpdateAllVideoStreamsFromParametersRequest request, CancellationToken cancellationToken)
    {

        (List<VideoStreamDto> videoStreams, _) = await Repository.VideoStream.UpdateAllVideoStreamsFromParameters(request.Parameters, request.Request, cancellationToken);
        if (videoStreams.Any())
        {
            await Publisher.Publish(new UpdateVideoStreamsEvent(videoStreams), cancellationToken).ConfigureAwait(false);
        }

        return videoStreams;
    }
}
