using HorasApi.Data;
using HorasApi.Dtos;
using HorasApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasApi.Controllers;

[ApiController]
[Route("api/proyectos")]
public class ProyectosController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProyectosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProyectoDto>>> GetAll()
    {
        var items = await _db.Proyectos
            .Include(p => p.Cliente)
            .OrderBy(p => p.Codigo)
            .Select(p => new ProyectoDto(p.Id, p.Codigo, p.Descripcion, p.ClienteId, p.Cliente!.Nombre))
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProyectoDto>> GetOne(int id)
    {
        var p = await _db.Proyectos.Include(x => x.Cliente).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();
        return new ProyectoDto(p.Id, p.Codigo, p.Descripcion, p.ClienteId, p.Cliente!.Nombre);
    }

    [HttpPost]
    public async Task<ActionResult<ProyectoDto>> Create(ProyectoInputDto input)
    {
        var cliente = await _db.Clientes.FindAsync(input.ClienteId);
        if (cliente is null) return BadRequest(new { message = "Cliente inexistente." });

        var p = new Proyecto
        {
            Codigo = $"TMP-{Guid.NewGuid():N}",
            Descripcion = input.Descripcion.Trim(),
            ClienteId = input.ClienteId
        };
        _db.Proyectos.Add(p);
        await _db.SaveChangesAsync();

        p.Codigo = $"PROJ-{p.Id:D4}";
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = p.Id },
            new ProyectoDto(p.Id, p.Codigo, p.Descripcion, p.ClienteId, cliente.Nombre));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProyectoInputDto input)
    {
        var p = await _db.Proyectos.FindAsync(id);
        if (p is null) return NotFound();

        var cliente = await _db.Clientes.FindAsync(input.ClienteId);
        if (cliente is null) return BadRequest(new { message = "Cliente inexistente." });

        p.Descripcion = input.Descripcion.Trim();
        p.ClienteId = input.ClienteId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Proyectos.FindAsync(id);
        if (p is null) return NotFound();
        _db.Proyectos.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
