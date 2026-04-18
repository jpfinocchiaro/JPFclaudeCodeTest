using System.ComponentModel.DataAnnotations;

namespace HorasApi.Dtos;

public record ClienteDto(int Id, string Nombre);

public class ClienteInputDto
{
    [Required, MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;
}
