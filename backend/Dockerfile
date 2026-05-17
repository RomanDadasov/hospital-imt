FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5171

ENV ASPNETCORE_URLS=http://+:5171/

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["HospitalManagement/HospitalManagement.API.csproj", "HospitalManagement/"]
COPY ["HospitalManagement.Application/HospitalManagement.Application.csproj", "HospitalManagement.Application/"]
COPY ["HospitalManagement.Domain/HospitalManagement.Domain.csproj", "HospitalManagement.Domain/"]
COPY ["HospitalManagement.Infrastructure/HospitalManagement.Infrastructure.csproj", "HospitalManagement.Infrastructure/"]

RUN dotnet restore "HospitalManagement/HospitalManagement.API.csproj"

COPY . .

WORKDIR "/src/HospitalManagement"
RUN dotnet build "HospitalManagement.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "HospitalManagement.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT [ "dotnet", "HospitalManagement.API.dll" ]