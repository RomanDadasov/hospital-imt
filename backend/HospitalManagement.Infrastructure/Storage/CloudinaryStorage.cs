using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using HospitalManagement.Storage;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HospitalManagement.Infrastructure.Storage
{
    public class CloudinaryStorage : IFileStorage
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryStorage> _logger;
        private readonly string _basePath;

        public CloudinaryStorage(IConfiguration configuration, ILogger<CloudinaryStorage> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _basePath = Path.Combine(env.ContentRootPath, "FileStorage");
            var account = new Account(
                configuration["Cloudinary:CloudName"],
                configuration["Cloudinary:ApiKey"],
                configuration["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
        }

        public async Task<StoredFileInfo> UploadAsync(Stream stream, string originalFileName, string contentType, string folderKey, CancellationToken cancellationToken = default)
        {

            if (contentType.StartsWith("image/"))
            {
                var publicId = $"{folderKey}/{Guid.NewGuid():N}";
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(originalFileName, stream),
                    PublicId = publicId,
                    Overwrite = false
                };
                var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
                if (result.Error != null)
                    throw new Exception($"Cloudinary upload error: {result.Error.Message}");

                _logger.LogInformation("Image uploaded to Cloudinary: {Url}", result.SecureUrl);

                return new StoredFileInfo
                {
                    StorageKey = result.SecureUrl.ToString(),
                    StoredFileName = originalFileName,
                    FileSize = result.Bytes
                };
            }


            var ext = Path.GetExtension(originalFileName);
            if (string.IsNullOrEmpty(ext)) ext = ".bin";
            var storedFileName = $"{Guid.NewGuid():N}{ext}";
            var relativePath = Path.Combine(folderKey, storedFileName);
            var fullPath = Path.Combine(_basePath, relativePath);
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
            await using var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true);
            await stream.CopyToAsync(fs, cancellationToken);
            var size = new FileInfo(fullPath).Length;

            _logger.LogInformation("File saved locally: {Path} ({Size} bytes)", fullPath, size);

            return new StoredFileInfo
            {
                StorageKey = relativePath.Replace("\\", "/"),
                StoredFileName = storedFileName,
                FileSize = size
            };
        }

        public async Task<Stream> OpenReadAsync(string storageKey, CancellationToken cancellationToken = default)
        {

            if (storageKey.StartsWith("http"))
            {
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync(storageKey, cancellationToken);
                response.EnsureSuccessStatusCode();
                var ms = new MemoryStream();
                await response.Content.CopyToAsync(ms, cancellationToken);
                ms.Position = 0;
                return ms;
            }

            var fullPath = Path.Combine(_basePath, storageKey.Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (!File.Exists(fullPath))
                throw new FileNotFoundException("File not found", storageKey);
            return new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true);
        }

        public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
        {

            if (storageKey.StartsWith("http"))
            {
                var publicId = ExtractPublicId(storageKey);
                var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId));
                if (result.Error != null)
                    _logger.LogWarning("Cloudinary delete error: {Error}", result.Error.Message);
                else
                    _logger.LogInformation("File deleted from Cloudinary: {PublicId}", publicId);
                return;
            }

            var fullPath = Path.Combine(_basePath, storageKey.Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted locally: {Path}", fullPath);
            }
        }

        private static string ExtractPublicId(string url)
        {
            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');
            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex < 0) return url;

            var start = uploadIndex + 1;
            if (start < segments.Length && segments[start].StartsWith("v") &&
                long.TryParse(segments[start][1..], out _))
                start++;

            return string.Join("/", segments[start..]);
        }
    }
}