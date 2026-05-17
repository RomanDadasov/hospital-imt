using AutoMapper;
using HospitalManagement.Application.Services;
using HospitalManagement.Common;
using HospitalManagement.DTOs;
using HospitalManagement.Models;
using HospitalManagement.Repositories;

namespace HospitalManagement.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _repository;
        private readonly IMapper _mapper;
        private readonly IAuditService _auditService;

        public PatientService(IPatientRepository repository, IMapper mapper, IAuditService auditService)
        {
            _repository = repository;
            _mapper = mapper;
            _auditService = auditService;
        }

        public async Task<PagedResult<PatientResponseDto>> GetAllAsync(QueryParameters parameters)
        {
            var all = await _repository.GetAllActiveAsync();
            var query = all.AsQueryable();

            if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
            {
                var term = parameters.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.FirstName.ToLower().Contains(term) ||
                    p.LastName.ToLower().Contains(term) ||
                    p.Email.ToLower().Contains(term));
            }

            var totalCount = query.Count();
            var items = query
                .Skip((parameters.Page - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToList();

            return PagedResult<PatientResponseDto>.Create(
                _mapper.Map<List<PatientResponseDto>>(items),
                parameters.Page, parameters.PageSize, totalCount);
        }

        public async Task<PatientResponseDto?> GetByIdAsync(Guid id)
        {
            var patient = await _repository.GetWithAppointmentsAsync(id);
            if (patient is null) return null;
            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto, string userId, string userFullName)
        {
            var patient = _mapper.Map<Patient>(dto);
            patient.Id = Guid.NewGuid();
            await _repository.AddAsync(patient);
            await _repository.SaveChangesAsync();

            await _auditService.LogAsync(
                userId, userFullName,
                "Created", "Patient",
                patient.Id.ToString(),
                $"{dto.FirstName} {dto.LastName} | {dto.Email}");

            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PatientResponseDto?> UpdateAsync(Guid id, UpdatePatientDto dto, string userId, string userFullName)
        {
            var patient = await _repository.GetWithAppointmentsAsync(id);
            if (patient is null) return null;
            _mapper.Map(dto, patient);
            await _repository.UpdateAsync(patient);
            await _repository.SaveChangesAsync();

            await _auditService.LogAsync(
                userId, userFullName,
                "Updated", "Patient",
                id.ToString(),
                $"{patient.FirstName} {patient.LastName}");

            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<bool> DeleteAsync(Guid id, string userId, string userFullName)
        {
            var patient = await _repository.GetByIdAsync(id);
            if (patient is null) return false;
            if (patient.Appointments.Any()) return false;

            await _auditService.LogAsync(
                userId, userFullName,
                "Deleted", "Patient",
                id.ToString(),
                $"{patient.FirstName} {patient.LastName}");

            await _repository.DeleteAsync(patient);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ArchiveAsync(Guid id)
        {
            var patient = await _repository.GetByIdAsync(id);
            if (patient is null) return false;
            patient.DeletedAt = DateTimeOffset.UtcNow;
            await _repository.UpdateAsync(patient);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
