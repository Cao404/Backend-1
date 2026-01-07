using Microsoft.AspNetCore.Mvc;
using wedduyhuy.DTOs;
using wedduyhuy.Repositories.Interfaces;

namespace wedduyhuy.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SanPhamController : ControllerBase
    {
        private readonly ISanPhamRepository _repo;

        public SanPhamController(ISanPhamRepository repo) => _repo = repo;

        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<SanPhamDto>>> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<ActionResult<SanPhamDto>> GetById(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("get-by-sku/{sku}")]
        public async Task<ActionResult<SanPhamDto>> GetBySKU(string sku)
        {
            var item = await _repo.GetBySKUAsync(sku);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("get-by-danhmuc/{danhMucId}")]
        public async Task<ActionResult<IEnumerable<SanPhamDto>>> GetByDanhMuc(int danhMucId)
        {
            return Ok(await _repo.GetByDanhMucAsync(danhMucId));
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<SanPhamDto>>> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest("Keyword required");
            return Ok(await _repo.SearchAsync(keyword));
        }

        [HttpPost("create")]
        public async Task<ActionResult<SanPhamDto>> Create([FromBody] CreateSanPhamDto dto)
        {
            var id = await _repo.CreateAsync(dto);
            var created = await _repo.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateSanPhamDto dto)
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
