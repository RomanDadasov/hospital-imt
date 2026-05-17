using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentResponseDto>> GetAllAsync();
        Task<DepartmentResponseDto?> GetByIdAsync(Guid id);
        Task<DepartmentResponseDto> CreateAsync(CreateDepartmentDto dto);
        Task<DepartmentResponseDto?> UpdateAsync(Guid id, UpdateDepartmentDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
