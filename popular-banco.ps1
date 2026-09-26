$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   POPULACAO IDEMPOTENTE DO BANCO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# FUNCOES AUXILIARES
# ============================================================

function Get-Lista {
    param (
        [string]$Endpoint
    )

    $resposta = Invoke-RestMethod `
        -Uri "$baseUrl$Endpoint" `
        -Method Get

    # A API retorna diretamente um array
    if ($resposta -is [System.Array]) {
        return @($resposta)
    }

    # Compatibilidade caso algum endpoint retorne { value: [...] }
    if ($null -ne $resposta.value) {
        return @($resposta.value)
    }

    # Caso a API retorne apenas um objeto
    if ($null -ne $resposta) {
        return @($resposta)
    }

    return @()
}
function Post-Json {
    param (
        [string]$Endpoint,
        [object]$Dados
    )

    $json = $Dados | ConvertTo-Json -Depth 10

    return Invoke-RestMethod `
        -Uri "$baseUrl$Endpoint" `
        -Method Post `
        -ContentType "application/json" `
        -Body $json
}

function Normalizar-Texto {
    param (
        [object]$Valor
    )

    if ($null -eq $Valor) {
        return ""
    }

    return $Valor.ToString().Trim().ToLower()
}

function Normalizar-CPF {
    param (
        [object]$Valor
    )

    if ($null -eq $Valor) {
        return ""
    }

    return ($Valor.ToString() -replace '\D', '')
}

function Normalizar-CNPJ {
    param (
        [object]$Valor
    )

    if ($null -eq $Valor) {
        return ""
    }

    return ($Valor.ToString() -replace '\D', '')
}

function Normalizar-Data {
    param (
        [object]$Valor
    )

    if ($null -eq $Valor) {
        return ""
    }

    try {
        return ([datetime]$Valor).ToString("yyyy-MM-dd")
    }
    catch {
        return $Valor.ToString().Substring(0, 10)
    }
}

function Normalizar-Hora {
    param (
        [object]$Valor
    )

    if ($null -eq $Valor) {
        return ""
    }

    return $Valor.ToString().Substring(0, 5)
}

# ============================================================
# BUSCAS
# ============================================================

function Encontrar-Especialidade {
    param (
        [array]$Lista,
        [string]$Nome
    )

    $nomeNormalizado = Normalizar-Texto $Nome

    return $Lista |
        Where-Object {
            (Normalizar-Texto $_.nome) -eq $nomeNormalizado
        } |
        Select-Object -First 1
}

function Encontrar-Clinica {
    param (
        [array]$Lista,
        [string]$Nome
    )

    $nomeNormalizado = Normalizar-Texto $Nome

    return $Lista |
        Where-Object {
            (Normalizar-Texto $_.nome) -eq $nomeNormalizado
        } |
        Select-Object -First 1
}

function Encontrar-Profissional {
    param (
        [array]$Lista,
        [string]$CPF
    )

    $cpfNormalizado = Normalizar-CPF $CPF

    return $Lista |
        Where-Object {
            (Normalizar-CPF $_.cpf) -eq $cpfNormalizado
        } |
        Select-Object -First 1
}

function Encontrar-Paciente {
    param (
        [array]$Lista,
        [string]$CPF
    )

    $cpfNormalizado = Normalizar-CPF $CPF

    return $Lista |
        Where-Object {
            (Normalizar-CPF $_.cpf) -eq $cpfNormalizado
        } |
        Select-Object -First 1
}

function Encontrar-Disponibilidade {
    param (
        [array]$Lista,
        [string]$IdProfissional,
        [string]$Data,
        [string]$HoraInicio,
        [string]$HoraFim
    )

    $dataNormalizada = Normalizar-Data $Data
    $inicioNormalizado = Normalizar-Hora $HoraInicio
    $fimNormalizado = Normalizar-Hora $HoraFim

    return $Lista |
        Where-Object {
            $_.id_profissional.ToString() -eq $IdProfissional.ToString() -and
            (Normalizar-Data $_.data) -eq $dataNormalizada -and
            (Normalizar-Hora $_.hora_inicio) -eq $inicioNormalizado -and
            (Normalizar-Hora $_.hora_fim) -eq $fimNormalizado
        } |
        Select-Object -First 1
}

function Encontrar-Agendamento {
    param (
        [array]$Lista,
        [string]$IdPaciente,
        [string]$IdProfissional,
        [string]$IdDisponibilidade
    )

    return $Lista |
        Where-Object {
            $_.id_paciente.ToString() -eq $IdPaciente.ToString() -and
            $_.id_profissional.ToString() -eq $IdProfissional.ToString() -and
            $_.id_disponibilidade.ToString() -eq $IdDisponibilidade.ToString()
        } |
        Select-Object -First 1
}

# ============================================================
# MASSA DE DADOS
# ============================================================

$especialidades = @(
    @{
        nome = "Dermatologia"
        descricao = "Especialidade médica voltada para diagnóstico e tratamento de doenças da pele."
    },
    @{
        nome = "Ortopedia"
        descricao = "Especialidade médica voltada para o sistema musculoesquelético."
    },
    @{
        nome = "Pediatria"
        descricao = "Especialidade médica voltada para a saúde de crianças e adolescentes."
    },
    @{
        nome = "Neurologia"
        descricao = "Especialidade médica voltada para doenças do sistema nervoso."
    }
)

$clinicas = @(
    @{
        nome = "Clinica Bem Estar"
        cnpj = "11222333000101"
        telefone = "8132221001"
        email = "contato@clinicabemestar.com.br"
        endereco = "Rua da Aurora, 500, Recife - PE"
        horario_funcionamento = "Segunda a sexta, 08:00 as 18:00"
    },
    @{
        nome = "Centro Medico Recife"
        cnpj = "22333444000102"
        telefone = "8132221002"
        email = "contato@centromedicorecife.com.br"
        endereco = "Av. Agamenon Magalhaes, 1200, Recife - PE"
        horario_funcionamento = "Segunda a sexta, 07:00 as 19:00"
    },
    @{
        nome = "Clinica Saude Integral"
        cnpj = "33444555000103"
        telefone = "8132221003"
        email = "contato@saudeintegral.com.br"
        endereco = "Rua do Espinheiro, 850, Recife - PE"
        horario_funcionamento = "Segunda a sabado, 08:00 as 17:00"
    },
    @{
        nome = "Instituto Medico Boa Vista"
        cnpj = "44555666000104"
        telefone = "8132221004"
        email = "contato@institutoboavista.com.br"
        endereco = "Rua Gervasio Pires, 300, Recife - PE"
        horario_funcionamento = "Segunda a sexta, 08:00 as 18:00"
    }
)

$profissionais = @(
    @{
        nome = "Dra. Mariana Costa"
        cpf = "22233344455"
        registro_profissional = "21001"
        conselho = "CRM"
        telefone = "81991110001"
        email = "mariana.costa@consulta.com.br"
        clinica = "Clinica Bem Estar"
        especialidade = "Dermatologia"
    },
    @{
        nome = "Dr. Rafael Almeida"
        cpf = "33344455566"
        registro_profissional = "21002"
        conselho = "CRM"
        telefone = "81991110002"
        email = "rafael.almeida@consulta.com.br"
        clinica = "Centro Medico Recife"
        especialidade = "Ortopedia"
    },
    @{
        nome = "Dra. Juliana Martins"
        cpf = "44455566677"
        registro_profissional = "21003"
        conselho = "CRM"
        telefone = "81991110003"
        email = "juliana.martins@consulta.com.br"
        clinica = "Clinica Saude Integral"
        especialidade = "Pediatria"
    },
    @{
        nome = "Dr. Felipe Santos"
        cpf = "55566677788"
        registro_profissional = "21004"
        conselho = "CRM"
        telefone = "81991110004"
        email = "felipe.santos@consulta.com.br"
        clinica = "Instituto Medico Boa Vista"
        especialidade = "Neurologia"
    },
    @{
        nome = "Dra. Camila Ferreira"
        cpf = "66677788899"
        registro_profissional = "21005"
        conselho = "CRM"
        telefone = "81991110005"
        email = "camila.ferreira@consulta.com.br"
        clinica = "Clinica Bem Estar"
        especialidade = "Ortopedia"
    },
    @{
        nome = "Dr. Bruno Oliveira"
        cpf = "77788899900"
        registro_profissional = "21006"
        conselho = "CRM"
        telefone = "81991110006"
        email = "bruno.oliveira@consulta.com.br"
        clinica = "Centro Medico Recife"
        especialidade = "Pediatria"
    },
    @{
        nome = "Dra. Larissa Rodrigues"
        cpf = "88899900011"
        registro_profissional = "21007"
        conselho = "CRM"
        telefone = "81991110007"
        email = "larissa.rodrigues@consulta.com.br"
        clinica = "Clinica Saude Integral"
        especialidade = "Neurologia"
    },
    @{
        nome = "Dr. Gustavo Lima"
        cpf = "99900011122"
        registro_profissional = "21008"
        conselho = "CRM"
        telefone = "81991110008"
        email = "gustavo.lima@consulta.com.br"
        clinica = "Instituto Medico Boa Vista"
        especialidade = "Dermatologia"
    }
)

$pacientes = @(
    @{
        nome = "Lucas Ferreira"
        cpf = "22233344401"
        data_nascimento = "1990-03-15"
        telefone = "81992220001"
        email = "lucas.ferreira@consulta.com.br"
        endereco = "Rua do Futuro, 100, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Mariana Alves"
        cpf = "22233344402"
        data_nascimento = "1988-07-22"
        telefone = "81992220002"
        email = "mariana.alves@consulta.com.br"
        endereco = "Rua Real da Torre, 200, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Pedro Henrique"
        cpf = "22233344403"
        data_nascimento = "1995-01-10"
        telefone = "81992220003"
        email = "pedro.henrique@consulta.com.br"
        endereco = "Av. Norte, 300, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Juliana Oliveira"
        cpf = "22233344404"
        data_nascimento = "1992-11-05"
        telefone = "81992220004"
        email = "juliana.oliveira@consulta.com.br"
        endereco = "Rua Benfica, 400, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Carlos Eduardo"
        cpf = "22233344405"
        data_nascimento = "1985-06-18"
        telefone = "81992220005"
        email = "carlos.eduardo@consulta.com.br"
        endereco = "Rua do Paissandu, 500, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Beatriz Souza"
        cpf = "22233344406"
        data_nascimento = "1998-09-27"
        telefone = "81992220006"
        email = "beatriz.souza@consulta.com.br"
        endereco = "Rua da Hora, 600, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Gabriel Santos"
        cpf = "22233344407"
        data_nascimento = "1991-04-12"
        telefone = "81992220007"
        email = "gabriel.santos@consulta.com.br"
        endereco = "Rua Joaquim Nabuco, 700, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Amanda Rodrigues"
        cpf = "22233344408"
        data_nascimento = "1996-12-03"
        telefone = "81992220008"
        email = "amanda.rodrigues@consulta.com.br"
        endereco = "Av. Rui Barbosa, 800, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Rafael Gomes"
        cpf = "22233344409"
        data_nascimento = "1987-02-25"
        telefone = "81992220009"
        email = "rafael.gomes@consulta.com.br"
        endereco = "Rua do Espinheiro, 900, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Larissa Martins"
        cpf = "22233344410"
        data_nascimento = "1993-08-14"
        telefone = "81992220010"
        email = "larissa.martins@consulta.com.br"
        endereco = "Rua Conselheiro Portela, 1000, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Thiago Lima"
        cpf = "22233344411"
        data_nascimento = "1989-05-30"
        telefone = "81992220011"
        email = "thiago.lima@consulta.com.br"
        endereco = "Rua Amelia, 1100, Recife - PE"
        senha = "123456"
    },
    @{
        nome = "Camila Mendes"
        cpf = "22233344412"
        data_nascimento = "1997-10-19"
        telefone = "81992220012"
        email = "camila.mendes@consulta.com.br"
        endereco = "Rua Padre Carapuceiro, 1200, Recife - PE"
        senha = "123456"
    }
)

$disponibilidades = @(
    @{ cpf = "22233344455"; data = "2026-09-27"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "22233344455"; data = "2026-09-27"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "33344455566"; data = "2026-09-28"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "33344455566"; data = "2026-09-28"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "44455566677"; data = "2026-09-29"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "44455566677"; data = "2026-09-29"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "55566677788"; data = "2026-09-30"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "55566677788"; data = "2026-09-30"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "66677788899"; data = "2026-10-01"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "66677788899"; data = "2026-10-01"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "77788899900"; data = "2026-10-02"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "77788899900"; data = "2026-10-02"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "88899900011"; data = "2026-10-03"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "88899900011"; data = "2026-10-03"; hora_inicio = "14:00"; hora_fim = "16:00" },

    @{ cpf = "99900011122"; data = "2026-10-04"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ cpf = "99900011122"; data = "2026-10-04"; hora_inicio = "14:00"; hora_fim = "16:00" }
)

$agendamentos = @(
    @{ paciente = "22233344401"; profissional = "22233344455"; data = "2026-09-27"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344402"; profissional = "33344455566"; data = "2026-09-28"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344403"; profissional = "44455566677"; data = "2026-09-29"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344404"; profissional = "55566677788"; data = "2026-09-30"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344405"; profissional = "66677788899"; data = "2026-10-01"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344406"; profissional = "77788899900"; data = "2026-10-02"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344407"; profissional = "88899900011"; data = "2026-10-03"; hora_inicio = "08:00"; hora_fim = "10:00" },
    @{ paciente = "22233344408"; profissional = "99900011122"; data = "2026-10-04"; hora_inicio = "08:00"; hora_fim = "10:00" }
)

# ============================================================
# CARREGAMENTO INICIAL
# ============================================================

Write-Host "Consultando dados existentes..." -ForegroundColor Yellow

$especialidadesExistentes = Get-Lista "/especialidades"
$clinicasExistentes = Get-Lista "/clinicas"
$profissionaisExistentes = Get-Lista "/profissionais"
$pacientesExistentes = Get-Lista "/pacientes"
$disponibilidadesExistentes = Get-Lista "/disponibilidades"
$agendamentosExistentes = Get-Lista "/agendamentos"

Write-Host "Especialidades encontradas: $($especialidadesExistentes.Count)"
Write-Host "Clinicas encontradas: $($clinicasExistentes.Count)"
Write-Host "Profissionais encontrados: $($profissionaisExistentes.Count)"
Write-Host "Pacientes encontrados: $($pacientesExistentes.Count)"
Write-Host "Disponibilidades encontradas: $($disponibilidadesExistentes.Count)"
Write-Host "Agendamentos encontrados: $($agendamentosExistentes.Count)"
Write-Host ""

$criadosEspecialidades = 0
$criadosClinicas = 0
$criadosProfissionais = 0
$criadosPacientes = 0
$criadosDisponibilidades = 0
$criadosAgendamentos = 0

# ============================================================
# 1. ESPECIALIDADES
# ============================================================

Write-Host "1. Verificando especialidades..." -ForegroundColor Cyan

foreach ($item in $especialidades) {

    $existente = Encontrar-Especialidade `
        -Lista $especialidadesExistentes `
        -Nome $item.nome

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($item.nome)" -ForegroundColor DarkGray

    }
    else {

        try {

            Post-Json "/especialidades" @{
                nome = $item.nome
                descricao = $item.descricao
            } | Out-Null

            Write-Host "  [CRIADO] $($item.nome)" -ForegroundColor Green
            $criadosEspecialidades++

        }
        catch {

            Write-Host "  [ERRO] $($item.nome): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

$especialidadesExistentes = Get-Lista "/especialidades"

# ============================================================
# 2. CLINICAS
# ============================================================

Write-Host ""
Write-Host "2. Verificando clinicas..." -ForegroundColor Cyan

foreach ($item in $clinicas) {

    $existente = Encontrar-Clinica `
        -Lista $clinicasExistentes `
        -Nome $item.nome

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($item.nome)" -ForegroundColor DarkGray

    }
    else {

        try {

            Post-Json "/clinicas" @{
                nome = $item.nome
                cnpj = $item.cnpj
                telefone = $item.telefone
                email = $item.email
                endereco = $item.endereco
                horario_funcionamento = $item.horario_funcionamento
            } | Out-Null

            Write-Host "  [CRIADO] $($item.nome)" -ForegroundColor Green
            $criadosClinicas++

        }
        catch {

            Write-Host "  [ERRO] $($item.nome): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

$clinicasExistentes = Get-Lista "/clinicas"

# ============================================================
# 3. PROFISSIONAIS
# ============================================================

Write-Host ""
Write-Host "3. Verificando profissionais..." -ForegroundColor Cyan

foreach ($item in $profissionais) {

    $existente = Encontrar-Profissional `
        -Lista $profissionaisExistentes `
        -CPF $item.cpf

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($item.nome)" -ForegroundColor DarkGray
        continue
    }

    $clinica = Encontrar-Clinica `
        -Lista $clinicasExistentes `
        -Nome $item.clinica

    if ($null -eq $clinica) {

        Write-Host "  [ERRO] $($item.nome): clinica nao encontrada" -ForegroundColor Red
        continue
    }

    $especialidade = Encontrar-Especialidade `
        -Lista $especialidadesExistentes `
        -Nome $item.especialidade

    if ($null -eq $especialidade) {

        Write-Host "  [ERRO] $($item.nome): especialidade nao encontrada" -ForegroundColor Red
        continue
    }

    try {

        Post-Json "/profissionais" @{
            nome = $item.nome
            cpf = $item.cpf
            registro_profissional = $item.registro_profissional
            conselho = $item.conselho
            telefone = $item.telefone
            email = $item.email
            id_clinica = [int]$clinica.id_clinica
            id_especialidade = [int]$especialidade.id_especialidade
        } | Out-Null

        Write-Host "  [CRIADO] $($item.nome)" -ForegroundColor Green
        $criadosProfissionais++

    }
    catch {

        Write-Host "  [ERRO] $($item.nome): $($_.Exception.Message)" -ForegroundColor Red
    }
}

$profissionaisExistentes = Get-Lista "/profissionais"

# ============================================================
# 4. PACIENTES
# ============================================================

Write-Host ""
Write-Host "4. Verificando pacientes..." -ForegroundColor Cyan

foreach ($item in $pacientes) {

    $existente = Encontrar-Paciente `
        -Lista $pacientesExistentes `
        -CPF $item.cpf

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($item.nome)" -ForegroundColor DarkGray
        continue
    }

    try {

        Post-Json "/pacientes" @{
            nome = $item.nome
            cpf = $item.cpf
            data_nascimento = $item.data_nascimento
            telefone = $item.telefone
            email = $item.email
            endereco = $item.endereco
            senha = $item.senha
        } | Out-Null

        Write-Host "  [CRIADO] $($item.nome)" -ForegroundColor Green
        $criadosPacientes++

    }
    catch {

        Write-Host "  [ERRO] $($item.nome): $($_.Exception.Message)" -ForegroundColor Red
    }
}

$pacientesExistentes = Get-Lista "/pacientes"

# ============================================================
# 5. DISPONIBILIDADES
# ============================================================

Write-Host ""
Write-Host "5. Verificando disponibilidades..." -ForegroundColor Cyan

foreach ($item in $disponibilidades) {

    $profissional = Encontrar-Profissional `
        -Lista $profissionaisExistentes `
        -CPF $item.cpf

    if ($null -eq $profissional) {

        Write-Host "  [ERRO] Profissional CPF $($item.cpf) nao encontrado" -ForegroundColor Red
        continue
    }

    $existente = Encontrar-Disponibilidade `
        -Lista $disponibilidadesExistentes `
        -IdProfissional $profissional.id_profissional `
        -Data $item.data `
        -HoraInicio $item.hora_inicio `
        -HoraFim $item.hora_fim

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($item.data) $($item.hora_inicio)-$($item.hora_fim) - $($profissional.nome)" -ForegroundColor DarkGray
        continue
    }

    try {

        Post-Json "/disponibilidades" @{
            id_profissional = [int]$profissional.id_profissional
            data = $item.data
            hora_inicio = $item.hora_inicio
            hora_fim = $item.hora_fim
        } | Out-Null

        Write-Host "  [CRIADO] $($item.data) $($item.hora_inicio)-$($item.hora_fim) - $($profissional.nome)" -ForegroundColor Green
        $criadosDisponibilidades++

    }
    catch {

        Write-Host "  [ERRO] $($item.data) $($item.hora_inicio)-$($item.hora_fim): $($_.Exception.Message)" -ForegroundColor Red
    }
}

$disponibilidadesExistentes = Get-Lista "/disponibilidades"

# ============================================================
# 6. AGENDAMENTOS
# ============================================================

Write-Host ""
Write-Host "6. Verificando agendamentos..." -ForegroundColor Cyan

foreach ($item in $agendamentos) {

    $paciente = Encontrar-Paciente `
        -Lista $pacientesExistentes `
        -CPF $item.paciente

    if ($null -eq $paciente) {

        Write-Host "  [ERRO] Paciente CPF $($item.paciente) nao encontrado" -ForegroundColor Red
        continue
    }

    $profissional = Encontrar-Profissional `
        -Lista $profissionaisExistentes `
        -CPF $item.profissional

    if ($null -eq $profissional) {

        Write-Host "  [ERRO] Profissional CPF $($item.profissional) nao encontrado" -ForegroundColor Red
        continue
    }

    $disponibilidade = Encontrar-Disponibilidade `
        -Lista $disponibilidadesExistentes `
        -IdProfissional $profissional.id_profissional `
        -Data $item.data `
        -HoraInicio $item.hora_inicio `
        -HoraFim $item.hora_fim

    if ($null -eq $disponibilidade) {

        Write-Host "  [ERRO] Disponibilidade nao encontrada para $($profissional.nome)" -ForegroundColor Red
        continue
    }

    $existente = Encontrar-Agendamento `
        -Lista $agendamentosExistentes `
        -IdPaciente $paciente.id_paciente `
        -IdProfissional $profissional.id_profissional `
        -IdDisponibilidade $disponibilidade.id_disponibilidade

    if ($null -ne $existente) {

        Write-Host "  [EXISTE] $($paciente.nome) - $($profissional.nome)" -ForegroundColor DarkGray
        continue
    }

    try {

        Post-Json "/agendamentos" @{
            id_paciente = [int]$paciente.id_paciente
            id_profissional = [int]$profissional.id_profissional
            id_disponibilidade = [int]$disponibilidade.id_disponibilidade
            observacao = "Consulta de teste - massa de dados"
        } | Out-Null

        Write-Host "  [CRIADO] $($paciente.nome) - $($profissional.nome)" -ForegroundColor Green
        $criadosAgendamentos++

    }
    catch {

        Write-Host "  [ERRO] $($paciente.nome) - $($profissional.nome): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# ============================================================
# RESUMO
# ============================================================

$especialidadesFinais = Get-Lista "/especialidades"
$clinicasFinais = Get-Lista "/clinicas"
$profissionaisFinais = Get-Lista "/profissionais"
$pacientesFinais = Get-Lista "/pacientes"
$disponibilidadesFinais = Get-Lista "/disponibilidades"
$agendamentosFinais = Get-Lista "/agendamentos"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "             RESUMO DA EXECUCAO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Criados nesta execucao:" -ForegroundColor Yellow
Write-Host "  Especialidades:      $criadosEspecialidades"
Write-Host "  Clinicas:            $criadosClinicas"
Write-Host "  Profissionais:       $criadosProfissionais"
Write-Host "  Pacientes:           $criadosPacientes"
Write-Host "  Disponibilidades:    $criadosDisponibilidades"
Write-Host "  Agendamentos:        $criadosAgendamentos"

Write-Host ""
Write-Host "Dados atuais no banco:" -ForegroundColor Yellow
Write-Host "  Especialidades:      $($especialidadesFinais.Count)"
Write-Host "  Clinicas:            $($clinicasFinais.Count)"
Write-Host "  Profissionais:       $($profissionaisFinais.Count)"
Write-Host "  Pacientes:           $($pacientesFinais.Count)"
Write-Host "  Disponibilidades:    $($disponibilidadesFinais.Count)"
Write-Host "  Agendamentos:        $($agendamentosFinais.Count)"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "        EXECUCAO CONCLUIDA" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""