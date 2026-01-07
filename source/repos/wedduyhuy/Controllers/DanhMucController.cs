using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DanhMucController : ControllerBase
    {
        private readonly IDanhMucRepository _repo;

        public DanhMucController(IDanhMucRepository repo) => _repo = repo;

        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<DanhMucDto>>> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<ActionResult<DanhMucDto>> GetById(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("get-by-parent/{parentId?}")]
        public async Task<ActionResult<IEnumerable<DanhMucDto>>> GetByParent(int? parentId = null)
        {
            return Ok(await _repo.GetByParentIdAsync(parentId));
        }

        [HttpPost("create")]
        public async Task<ActionResult<DanhMucDto>> Create([FromBody] CreateDanhMucDto dto)
        {
            var id = await _repo.CreateAsync(dto);
            var created = await _repo.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateDanhMucDto dto)
        {
            if (await _repo.GetByIdAsync(id) == null) return NotFound();
            await _repo.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            if (await _repo.GetByIdAsync(id) == null) return NotFound();
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
