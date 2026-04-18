using HorasApi.Data;
using HorasApi.Dtos;
using HorasApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasApi.Controllers;

[ApiController]
[Route("api/registros-horas")]
public class RegistrosHorasController : ControllerBase
{
    private readonly AppDbContext _db;
    public RegistrosHorasController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegistroHorasDto>>> GetAll([FromQuery] int? proyectoId)
    {
        var q = _db.Registros.AsQueryable();
        if (proyectoId.HasValue) q = q.Where(r => r.ProyectoId == proyectoId.Value);

        var items = await q
            .OrderByDescending(r => r.Fecha).ThenByDescending(r => r.Id)
            .Select(r => new RegistroHorasDto(r.Id, r.ProyectoId, r.Fecha, r.Horas, r.Descripcion))
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RegistroHorasDto>> GetOne(int id)
    {
        var r = await _db.Registros.FindAsync(id);
        if (r is null) return NotFound();
        return new RegistroHorasDto(r.Id, r.ProyectoId, r.Fecha, r.Horas, r.Descripcion);
    }

    [HttpPost]
    public async Task<ActionResult<RegistroHorasDto>> Create(RegistroHorasInputDto input)
    {
        if (!await _db.Proyectos.AnyAsync(p => p.Id == input.ProyectoId))
            return BadRequest(new { message = "Proyecto inexistente." });

        var r = new RegistroHoras
        {
            ProyectoId = input.ProyectoId,
            Fecha = input.Fecha,
            Horas = input.Horas,
            Descripcion = input.Descripcion?.Trim()
        };
        _db.Registros.Add(r);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = r.Id },
            new RegistroHorasDto(r.Id, r.ProyectoId, r.Fecha, r.Horas, r.Descripcion));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, RegistroHorasInputDto input)
    {
        var r = await _db.Registros.FindAsync(id);
        if (r is null) return NotFound();

        if (!await _db.Proyectos.AnyAsync(p => p.Id == input.ProyectoId))
            return BadRequest(new { message = "Proyecto inexistente." });

        r.ProyectoId = input.ProyectoId;
        r.Fecha = input.Fecha;
        r.Horas = input.Horas;
        r.Descripcion = input.Descripcion?.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var r = await _db.Registros.FindAsync(id);
        if (r is null) return NotFound();
        _db.Registros.Remove(r);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
