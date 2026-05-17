using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.DTOs;

namespace HospitalManagement.Services
{
    public interface IAppointmentService
    {
        Task<PagedResult<AppointmentResponseDto>> GetAllAsync(AppointmentQueryParameters parameters);
        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);
        Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto, string createdByUserId, string createdByUserFullName);
        Task<AppointmentResponseDto?> UpdateAsync(Guid id, UpdateAppointmentDto dto);
        Task<bool> DeleteAsync(Guid id, string userId, string userFullName);
        Task<bool> ArchiveAsync(Guid id);
        Task<AppointmentResponseDto?> ChangeStatusAsync(Guid id, ChangeAppointmentStatusDto dto, string userId, string userFullName);
        Task<IEnumerable<AppointmentResponseDto>> GetByDoctorUserIdAsync(string userId, string? status = null, int page = 1, int pageSize = 20);
        Task<byte[]> GeneratePdfAsync(Guid id);
        Task<byte[]> GenerateDocxAsync(Guid id);
        Task<AppointmentStatsDto> GetStatsAsync();

    }
}
