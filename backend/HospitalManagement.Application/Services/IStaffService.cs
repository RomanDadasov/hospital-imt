using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IStaffService
    {
        Task<IEnumerable<StaffResponseDto>> GetAllAsync();
        Task<StaffResponseDto> CreateAsync(CreateStaffDto dto);
        Task<bool> DeleteAsync(string userId);
    }
}
