using HorasApi.Data;
using HorasApi.Dtos;
using HorasApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasApi.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ClientesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetAll()
    {
        var clientes = await _db.Clientes
            .OrderBy(c => c.Nombre)
            .Select(c => new ClienteDto(c.Id, c.Nombre))
            .ToListAsync();
        return Ok(clientes);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> GetOne(int id)
    {
        var c = await _db.Clientes.FindAsync(id);
        if (c is null) return NotFound();
        return new ClienteDto(c.Id, c.Nombre);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Create(ClienteInputDto input)
    {
        var c = new Cliente { Nombre = input.Nombre.Trim() };
        _db.Clientes.Add(c);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = c.Id }, new ClienteDto(c.Id, c.Nombre));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ClienteInputDto input)
    {
        var c = await _db.Clientes.FindAsync(id);
        if (c is null) return NotFound();
        c.Nombre = input.Nombre.Trim();
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.Clientes.Include(x => x.Proyectos).FirstOrDefaultAsync(x => x.Id == id);
        if (c is null) return NotFound();
        if (c.Proyectos.Any())
            return Conflict(new { message = "No se puede eliminar: el cliente tiene proyectos asociados." });
        _db.Clientes.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
