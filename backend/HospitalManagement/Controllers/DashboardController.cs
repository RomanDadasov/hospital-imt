using HospitalManagement.Application.DTOs;
using HospitalManagement.Common;
using HospitalManagement.Data;
using HospitalManagement.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HospitalManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        [Authorize(Policy = "AdminOrReceptionist")]
        public async Task<IActionResult> GetStats()
        {
            var today = DateTimeOffset.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var totalPatients = await _context.Patients.CountAsync(p => p.DeletedAt == null);
            var totalDoctors = await _context.Doctors.CountAsync(d => d.DeletedAt == null);

            var todayAppointments = await _context.Appointments
                .CountAsync(a =>
                    a.DeletedAt == null &&
                    a.AppointmentDate >= today &&
                    a.AppointmentDate < tomorrow);

            var pendingAppointments = await _context.Appointments
                .CountAsync(a =>
                    a.DeletedAt == null &&
                    a.Status == AppointmentStatus.Pending);

            var recentAppointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Where(a => a.DeletedAt == null)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new RecentAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.FullName,
                    PatientId = a.PatientId,
                    DoctorName = a.Doctor.User.FullName,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString()
                })
                .ToListAsync();

            var deps = await _context.Departments
                .Include(d => d.Doctors)
                .Select(d => new DepartmentStatsDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    ImageUrl = d.ImageUrl,
                    DoctorCount = d.Doctors.Count(doc => doc.DeletedAt == null)
                })
                .ToListAsync();

            return Ok(ApiResponse<DashboardStatsDto>.SuccessResponse(new DashboardStatsDto
            {
                TotalPatients = totalPatients,
                TotalDoctors = totalDoctors,
                TodayAppointments = todayAppointments,
                PendingAppointments = pendingAppointments,
                RecentAppointments = recentAppointments,
                Departments = deps
            }));
        }

        [HttpGet("doctor-stats")]
        [Authorize(Policy = "AllRoles")]
        public async Task<IActionResult> GetDoctorStats()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var doctor = await _context.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId && d.DeletedAt == null);

            if (doctor is null)
                return NotFound(ApiResponse<object>.FailureResponse("Doctor not found"));

            var today = DateTimeOffset.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var allAppointments = await _context.Appointments
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctor.Id && a.DeletedAt == null)
                .ToListAsync();

            var todayCount = allAppointments.Count(a =>
                a.AppointmentDate >= today && a.AppointmentDate < tomorrow);

            var pendingCount = allAppointments.Count(a => a.Status == AppointmentStatus.Pending);
            var uniquePatients = allAppointments.Select(a => a.PatientId).Distinct().Count();

            var recentAppointments = allAppointments
                .OrderByDescending(a => a.AppointmentDate)
                .Take(5)
                .Select(a => new RecentAppointmentDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.FullName,
                    PatientId = a.PatientId,
                    DoctorName = "",
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status.ToString()
                }).ToList();

            return Ok(ApiResponse<DashboardStatsDto>.SuccessResponse(new DashboardStatsDto
            {
                TotalPatients = uniquePatients,
                TotalDoctors = 0,
                TodayAppointments = todayCount,
                PendingAppointments = pendingCount,
                RecentAppointments = recentAppointments,
                Departments = new()
            }));
        }

        [HttpGet("pharmacist-stats")]
        [Authorize(Policy = "AllRoles")]
        public async Task<IActionResult> GetPharmacistStats()
        {
            var today = DateTimeOffset.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var totalPrescriptions = await _context.Prescriptions.CountAsync();
            var dispensedToday = await _context.Prescriptions
                .CountAsync(p => p.IsDispensed &&
                    p.DispensedAt >= today &&
                    p.DispensedAt < tomorrow);
            var pendingPrescriptions = await _context.Prescriptions
                .CountAsync(p => !p.IsDispensed);

            return Ok(ApiResponse<DashboardStatsDto>.SuccessResponse(new DashboardStatsDto
            {
                TotalPatients = totalPrescriptions,
                TotalDoctors = dispensedToday,
                TodayAppointments = dispensedToday,
                PendingAppointments = pendingPrescriptions,
                RecentAppointments = new(),
                Departments = new()
            }));
        }
    }
}