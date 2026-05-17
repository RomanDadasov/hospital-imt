using AutoMapper;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using HospitalManagement.Data;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using HospitalManagement.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HospitalManagement.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _repository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _context;
        private readonly IAuditService _auditService;

        public DoctorService(IDoctorRepository repository, IDepartmentRepository departmentRepository, IMapper mapper, UserManager<ApplicationUser> userManager, IEmailService emailService, AppDbContext context, IAuditService auditService)
        {
            _repository = repository;
            _departmentRepository = departmentRepository;
            _mapper = mapper;
            _userManager = userManager;
            _emailService = emailService;
            _context = context;
            _auditService = auditService;
        }

        public async Task<PagedResult<DoctorResponseDto>> GetAllAsync(DoctorQueryParameters parameters)
        {
            var all = await _repository.GetAllActiveAsync();
            var query = all.AsQueryable();

            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                var term = parameters.SearchTerm.ToLower();
                query = query.Where(d =>
                    d.User.FirstName.ToLower().Contains(term) ||
                    d.User.LastName.ToLower().Contains(term) ||
                    d.Specialization.ToLower().Contains(term));
            }

            if (parameters.DepartmentId.HasValue)
                query = query.Where(d => d.DepartmentId == parameters.DepartmentId.Value);

            var totalCount = query.Count();
            var items = query
                .Skip((parameters.Page - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToList();

            return PagedResult<DoctorResponseDto>.Create(
                _mapper.Map<List<DoctorResponseDto>>(items),
                parameters.Page, parameters.PageSize, totalCount);
        }

        public async Task<DoctorResponseDto?> GetByIdAsync(Guid id)
        {
            var doctor = await _repository.GetWithDetailsAsync(id);
            if (doctor is null) return null;
            return _mapper.Map<DoctorResponseDto>(doctor);
        }

        public async Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto, string userId, string userFullName)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(user, "Doctor");

            var doctor = new Doctor
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                DepartmentId = dto.DepartmentId,
                Specialization = dto.Specialization,
                Phone = dto.Phone,
                ConsultationFee = dto.ConsultationFee,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(doctor);
            await _repository.SaveChangesAsync();

            await _auditService.LogAsync(
                userId, userFullName,
                "Created", "Doctor",
                doctor.Id.ToString(),
                $"Dr. {dto.FirstName} {dto.LastName} | {dto.Specialization}");

            try { await _emailService.SendWelcomeDoctorAsync(dto.Email, $"{dto.FirstName} {dto.LastName}", dto.Password); } catch { }

            var created = await _repository.GetWithDetailsAsync(doctor.Id);
            return _mapper.Map<DoctorResponseDto>(created!);
        }

        public async Task<DoctorResponseDto?> UpdateAsync(Guid id, UpdateDoctorDto dto, string userId, string userFullName)
        {
            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null);
            if (doctor is null) return null;

            doctor.Specialization = dto.Specialization;
            doctor.Phone = dto.Phone;
            doctor.DepartmentId = dto.DepartmentId;
            doctor.ConsultationFee = dto.ConsultationFee;
            await _context.SaveChangesAsync();

            await _auditService.LogAsync(
                userId, userFullName,
                "Updated", "Doctor",
                id.ToString(),
                $"Dr. {doctor.User.FullName} | {dto.Specialization}");

            var updated = await _repository.GetWithDetailsAsync(id);
            return _mapper.Map<DoctorResponseDto>(updated!);
        }

        public async Task<bool> DeleteAsync(Guid id, string userId, string userFullName)
        {
            var doctor = await _repository.GetWithDetailsAsync(id);
            if (doctor is null) return false;

            var doctorName = doctor.User.FullName;
            var specialization = doctor.Specialization;

            await _auditService.LogAsync(
                userId, userFullName,
                "Deleted", "Doctor",
                id.ToString(),
                $"Dr. {doctorName} | {specialization}");

          
            doctor.DeletedAt = DateTimeOffset.UtcNow;

          
            var appointments = await _context.Appointments
                .Where(a => a.DoctorId == id && a.DeletedAt == null)
                .ToListAsync();

            foreach (var apt in appointments)
            {
                apt.DeletedAt = DateTimeOffset.UtcNow;
            }

            await _repository.UpdateAsync(doctor);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}