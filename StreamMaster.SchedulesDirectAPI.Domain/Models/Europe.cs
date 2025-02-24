﻿using StreamMaster.SchedulesDirectAPI.Domain.Interfaces.Models;

using System.Text.Json.Serialization;

namespace StreamMaster.SchedulesDirectAPI.Domain.Models;

public class Europe : IEurope
{
    [JsonPropertyName("fullName")]
    public string FullName { get; set; }

    [JsonPropertyName("shortName")]
    public string ShortName { get; set; }

    [JsonPropertyName("postalCodeExample")]
    public string PostalCodeExample { get; set; }

    [JsonPropertyName("postalCode")]
    public string PostalCode { get; set; }

    [JsonPropertyName("onePostalCode")]
    public bool? OnePostalCode { get; set; }

    public Europe() { }
}
