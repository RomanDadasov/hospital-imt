using HospitalManagement.Common;
using HospitalManagement.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    patients = new List<object>(),
                    doctors = new List<object>(),
                    appointments = new List<object>()
                }));

            var search = q.ToLower().Trim();

            var patients = await _context.Patients
                .Where(p =>
                    p.FirstName.ToLower().Contains(search) ||
                    p.LastName.ToLower().Contains(search) ||
                    p.Email.ToLower().Contains(search) ||
                    (p.Phone != null && p.Phone.ToLower().Contains(search)))
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    Name = p.FirstName + " " + p.LastName,
                    p.Email,
                    p.Phone,
                    Type = "patient"
                })
                .ToListAsync();

            var doctors = await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Department)
                .Where(d =>
                    d.User.FirstName.ToLower().Contains(search) ||
                    d.User.LastName.ToLower().Contains(search) ||
                    d.Specialization.ToLower().Contains(search) ||
                    (d.Phone != null && d.Phone.ToLower().Contains(search)))
                .Take(5)
                .Select(d => new
                {
                    d.Id,
                    Name = d.User.FirstName + " " + d.User.LastName,
                    d.Specialization,
                    Department = d.Department.Name,
                    Type = "doctor"
                })
                .ToListAsync();

            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Where(a =>
                    a.Patient.FirstName.ToLower().Contains(search) ||
                    a.Patient.LastName.ToLower().Contains(search) ||
                    a.Doctor.User.FirstName.ToLower().Contains(search) ||
                    a.Doctor.User.LastName.ToLower().Contains(search))
                .OrderByDescending(a => a.AppointmentDate)
                .Take(5)
                .Select(a => new
                {
                    a.Id,
                    PatientName = a.Patient.FirstName + " " + a.Patient.LastName,
                    DoctorName = a.Doctor.User.FirstName + " " + a.Doctor.User.LastName,
                    a.AppointmentDate,
                    a.Status,
                    Type = "appointment"
                })
                .ToListAsync();

            var staff = await _context.Users
                .Where(u =>
                (u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search)) &&
                _context.UserRoles
                .Join(_context.Roles,
                ur => ur.RoleId,
                r => r.Id,
                (ur, r) => new { ur.UserId, r.Name })
                .Any(x => x.UserId == u.Id &&
                (x.Name == "Receptionist" || x.Name == "Admin" || x.Name == "Pharmacist")))
                .Take(5)
                .Select(u => new
                {
                    u.Id,
                    Name = u.FirstName + " " + u.LastName,
                    u.Email,
                    Type = "staff"
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.SuccessResponse(new { patients, doctors, appointments, staff }));
        }
    }
}
