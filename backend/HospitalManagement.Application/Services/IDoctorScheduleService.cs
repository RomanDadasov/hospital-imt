using HospitalManagement.Application.DTOs;

namespace HospitalManagement.Application.Services
{
    public interface IDoctorScheduleService
    {
        Task<IEnumerable<DoctorScheduleDto>> GetByDoctorIdAsync(Guid doctorId);
        Task<DoctorWeeklyScheduleDto?> GetWeeklyScheduleAsync(Guid doctorId, DateTime weekStart);
        Task<DoctorScheduleDto> CreateAsync(CreateDoctorScheduleDto dto);
        Task<DoctorScheduleDto?> UpdateAsync(Guid id, UpdateDoctorScheduleDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<IEnumerable<DoctorWeeklyScheduleDto>> GetAllDoctorsScheduleAsync(DateTime weekStart);
    }
}
