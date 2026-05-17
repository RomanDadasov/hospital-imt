using HospitalManagement.Data;
using HospitalManagement.Models;
using Microsoft.EntityFrameworkCore;
namespace HospitalManagement.Repositories
{
    public class AppointmentRepository : Repository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(AppDbContext context) : base(context) { }
        public async Task<IEnumerable<Appointment>> GetAllActiveAsync()
        {
            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Patient)
                .Include(a => a.Attachments)
                .Include(a => a.Payment)
                .Where(a => a.DeletedAt == null)
                .ToListAsync();
        }
        public async Task<Appointment?> GetWithDetailsAsync(Guid id)
        {
            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Patient)
                .Include(a => a.Attachments)
                .Include(a => a.Payment)
                .FirstOrDefaultAsync(a => a.Id == id && a.DeletedAt == null);
        }
        public async Task<IEnumerable<Appointment>> GetByDoctorAsync(Guid doctorId)
        {
            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Patient)
                .Include(a => a.Attachments)
                .Include(a => a.Payment)
                .Where(a => a.DoctorId == doctorId && a.DeletedAt == null)
                .ToListAsync();
        }
        public async Task<IEnumerable<Appointment>> GetByPatientAsync(Guid patientId)
        {
            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Patient)
                .Include(a => a.Attachments)
                .Include(a => a.Payment)
                .Where(a => a.PatientId == patientId && a.DeletedAt == null)
                .ToListAsync();
        }


        public async Task<IEnumerable<Appointment>> GetByDoctorUserIdPagedAsync(string userId, string? status, int page, int pageSize)
        {
            var query = _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Doctor).ThenInclude(d => d.Department)
                .Include(a => a.Patient)
                .Include(a => a.Attachments)
                .Include(a => a.Payment)
                .Where(a => a.Doctor.UserId == userId && a.DeletedAt == null);

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<AppointmentStatus>(status, true, out var s))
                query = query.Where(a => a.Status == s);

            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}