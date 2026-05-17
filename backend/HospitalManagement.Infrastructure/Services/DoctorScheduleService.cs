using HospitalManagement.Application.DTOs;
using HospitalManagement.Application.Services;
using HospitalManagement.Data;
using HospitalManagement.Domain.Models;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Infrastructure.Services
{
    public class DoctorScheduleService : IDoctorScheduleService
    {
        private readonly AppDbContext _context;

        public DoctorScheduleService(AppDbContext context)
        {
            _context = context;
        }

        private static readonly string[] DayNames = { "Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə" };

        public async Task<IEnumerable<DoctorScheduleDto>> GetByDoctorIdAsync(Guid doctorId)
        {
            return await _context.DoctorSchedules
                .Include(s => s.Doctor).ThenInclude(d => d.User)
                .Include(s => s.Doctor).ThenInclude(d => d.Department)
                .Where(s => s.DoctorId == doctorId)
                .OrderBy(s => s.DayOfWeek)
                .Select(s => new DoctorScheduleDto
                {
                    Id = s.Id,
                    DoctorId = s.DoctorId,
                    DoctorName = s.Doctor.User.FullName,
                    Department = s.Doctor.Department.Name,
                    DayOfWeek = (int)s.DayOfWeek,
                    DayName = DayNames[(int)s.DayOfWeek],
                    StartTime = s.StartTime.ToString(@"hh\:mm"),
                    EndTime = s.EndTime.ToString(@"hh\:mm"),
                    SlotDurationMinutes = s.SlotDurationMinutes,
                    IsActive = s.IsActive
                })
                .ToListAsync();
        }

        public async Task<DoctorWeeklyScheduleDto?> GetWeeklyScheduleAsync(Guid doctorId, DateTime weekStart)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Include(d => d.Schedules)
                .FirstOrDefaultAsync(d => d.Id == doctorId && d.DeletedAt == null);

            if (doctor is null) return null;

            var weekEnd = weekStart.AddDays(7);
            var bookedAppointments = await _context.Appointments
                .Where(a =>
                    a.DoctorId == doctorId &&
                    a.DeletedAt == null &&
                    a.AppointmentDate >= weekStart &&
                    a.AppointmentDate < weekEnd &&
                    a.Status != AppointmentStatus.Cancelled)
                .Select(a => a.AppointmentDate)
                .ToListAsync();

            var weekDays = new List<DayScheduleDto>();

            for (int i = 0; i < 7; i++)
            {
                var date = weekStart.AddDays(i);
                var dayOfWeek = date.DayOfWeek;
                var schedule = doctor.Schedules.FirstOrDefault(s => s.DayOfWeek == dayOfWeek && s.IsActive);

                var dayDto = new DayScheduleDto
                {
                    DayOfWeek = (int)dayOfWeek,
                    DayName = DayNames[(int)dayOfWeek],
                    Date = date,
                    IsWorkingDay = schedule != null,
                    StartTime = schedule?.StartTime.ToString(@"hh\:mm"),
                    EndTime = schedule?.EndTime.ToString(@"hh\:mm"),
                    SlotDurationMinutes = schedule?.SlotDurationMinutes ?? 30,
                    Slots = new List<SlotDto>()
                };

                if (schedule != null)
                {
                    var current = schedule.StartTime;
                    while (current + TimeSpan.FromMinutes(schedule.SlotDurationMinutes) <= schedule.EndTime)
                    {
                        var slotDateTime = date.Date + current;
                        var isBooked = bookedAppointments.Any(a =>
                            a.Date == date.Date &&
                            a.TimeOfDay >= current &&
                            a.TimeOfDay < current + TimeSpan.FromMinutes(schedule.SlotDurationMinutes));

                        dayDto.Slots.Add(new SlotDto
                        {
                            Time = current.ToString(@"hh\:mm"),
                            DateTime = slotDateTime,
                            IsBooked = isBooked
                        });

                        current += TimeSpan.FromMinutes(schedule.SlotDurationMinutes);
                    }
                }

                weekDays.Add(dayDto);
            }

            return new DoctorWeeklyScheduleDto
            {
                DoctorId = doctor.Id,
                DoctorName = doctor.User.FullName,
                Department = doctor.Department.Name,
                Specialization = doctor.Specialization,
                ProfileImageUrl = doctor.User.ProfileImagePath,
                WeekDays = weekDays
            };
        }

        public async Task<IEnumerable<DoctorWeeklyScheduleDto>> GetAllDoctorsScheduleAsync(DateTime weekStart)
        {
            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Include(d => d.Schedules)
                .Where(d => d.DeletedAt == null && d.Schedules.Any(s => s.IsActive))
                .ToListAsync();

            var result = new List<DoctorWeeklyScheduleDto>();
            foreach (var doctor in doctors)
            {
                var schedule = await GetWeeklyScheduleAsync(doctor.Id, weekStart);
                if (schedule != null) result.Add(schedule);
            }
            return result;
        }

        public async Task<DoctorScheduleDto> CreateAsync(CreateDoctorScheduleDto dto)
        {
            var existing = await _context.DoctorSchedules
                .FirstOrDefaultAsync(s => s.DoctorId == dto.DoctorId && (int)s.DayOfWeek == dto.DayOfWeek);

            if (existing != null)
            {
                existing.StartTime = TimeSpan.Parse(dto.StartTime);
                existing.EndTime = TimeSpan.Parse(dto.EndTime);
                existing.SlotDurationMinutes = dto.SlotDurationMinutes;
                existing.IsActive = true;
                await _context.SaveChangesAsync();
                return await GetScheduleDtoAsync(existing.Id);
            }

            var schedule = new DoctorSchedule
            {
                Id = Guid.NewGuid(),
                DoctorId = dto.DoctorId,
                DayOfWeek = (DayOfWeek)dto.DayOfWeek,
                StartTime = TimeSpan.Parse(dto.StartTime),
                EndTime = TimeSpan.Parse(dto.EndTime),
                SlotDurationMinutes = dto.SlotDurationMinutes,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.DoctorSchedules.Add(schedule);
            await _context.SaveChangesAsync();
            return await GetScheduleDtoAsync(schedule.Id);
        }

        public async Task<DoctorScheduleDto?> UpdateAsync(Guid id, UpdateDoctorScheduleDto dto)
        {
            var schedule = await _context.DoctorSchedules.FindAsync(id);
            if (schedule is null) return null;

            schedule.StartTime = TimeSpan.Parse(dto.StartTime);
            schedule.EndTime = TimeSpan.Parse(dto.EndTime);
            schedule.SlotDurationMinutes = dto.SlotDurationMinutes;
            schedule.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return await GetScheduleDtoAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var schedule = await _context.DoctorSchedules.FindAsync(id);
            if (schedule is null) return false;
            _context.DoctorSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<DoctorScheduleDto> GetScheduleDtoAsync(Guid id)
        {
            var s = await _context.DoctorSchedules
                .Include(x => x.Doctor).ThenInclude(d => d.User)
                .Include(x => x.Doctor).ThenInclude(d => d.Department)
                .FirstAsync(x => x.Id == id);

            return new DoctorScheduleDto
            {
                Id = s.Id,
                DoctorId = s.DoctorId,
                DoctorName = s.Doctor.User.FullName,
                Department = s.Doctor.Department.Name,
                DayOfWeek = (int)s.DayOfWeek,
                DayName = DayNames[(int)s.DayOfWeek],
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime = s.EndTime.ToString(@"hh\:mm"),
                SlotDurationMinutes = s.SlotDurationMinutes,
                IsActive = s.IsActive
            };
        }
    }
}
