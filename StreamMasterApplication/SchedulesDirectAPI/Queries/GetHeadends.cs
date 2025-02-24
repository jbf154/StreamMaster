﻿using StreamMaster.SchedulesDirectAPI.Domain.Interfaces;
using StreamMaster.SchedulesDirectAPI.Domain.Models;

namespace StreamMasterApplication.SchedulesDirectAPI.Queries;

public record GetHeadends(string country, string postalCode) : IRequest<List<HeadendDto>>;

internal class GetHeadendsHandler(ISDService sdService) : IRequestHandler<GetHeadends, List<HeadendDto>>
{
    public async Task<List<HeadendDto>> Handle(GetHeadends request, CancellationToken cancellationToken)
    {
        List<HeadendDto> ret = new();
        if (string.IsNullOrEmpty(request.country) || string.IsNullOrEmpty(request.postalCode))
        {
            return ret;
        }

        //Setting setting = await settingsService.GetSettingsAsync();
        //SchedulesDirect sd = new(setting.ClientUserAgent, setting.SDUserName, setting.SDPassword);
        //SDStatus status = await sd.GetStatus(cancellationToken).ConfigureAwait(false);
        //if (status?.systemStatus.Any() != true)
        //{
        //    Console.WriteLine("Status is null");
        //    return ret;
        //}

        //SDSystemStatus systemStatus = status.systemStatus[0];
        //if (systemStatus.status == "Offline")
        //{
        //    Console.WriteLine($"Status is {systemStatus.status}");
        //    return ret;
        //}

        List<Headend>? headends = await sdService.GetHeadends(request.country, request.postalCode, cancellationToken).ConfigureAwait(false);
        if (headends == null || !headends.Any())
        {
            return ret;
        }
        foreach (Headend headend in headends)
        {
            //if (headend.lineups.Count() > 1)
            //{
            //    continue;
            //}
            foreach (StreamMaster.SchedulesDirectAPI.Domain.Models.Lineup lineup in headend.lineups)
            {
                if (lineup.IsDeleted)
                {
                    continue;
                }
                ret.Add(new HeadendDto
                {
                    Headend = headend.headend,
                    Lineup = lineup.LineupString,
                    location = headend.location,
                    Name = lineup.Name,
                    Transport = headend.transport
                });
            }
        }

        return ret;
    }
}