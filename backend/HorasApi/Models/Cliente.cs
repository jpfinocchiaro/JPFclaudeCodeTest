using System.ComponentModel.DataAnnotations;

namespace HorasApi.Models;

public class Cliente
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;

    public List<Proyecto> Proyectos { get; set; } = new();
}
