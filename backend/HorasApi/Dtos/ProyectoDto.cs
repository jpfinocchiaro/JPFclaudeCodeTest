using System.ComponentModel.DataAnnotations;

namespace HorasApi.Dtos;

public record ProyectoDto(int Id, string Codigo, string Descripcion, int ClienteId, string ClienteNombre);

public class ProyectoInputDto
{
    [Required, MaxLength(500)]
    public string Descripcion { get; set; } = string.Empty;

    [Required]
    public int ClienteId { get; set; }
}
