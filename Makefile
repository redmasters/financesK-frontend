# =============================================================================
# Makefile para FinancesK Frontend - Comandos Docker simplificados
# =============================================================================

.PHONY: help dev dev-mock prod prod-mock test build clean logs stop restart health

# Variáveis
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = financesk

# Help - mostra comandos disponíveis
help:
	@echo "FinancesK Frontend - Comandos Docker Disponíveis:"
	@echo ""
	@echo "🚀 Desenvolvimento:"
	@echo "  make dev              - Inicia ambiente de desenvolvimento (com backend REAL)"
	@echo "  make dev-mock         - Inicia ambiente de desenvolvimento (com backend MOCK)"
	@echo "  make dev-logs         - Mostra logs do ambiente de desenvolvimento"
	@echo "  make dev-mock-logs    - Mostra logs do ambiente de desenvolvimento com mock"
	@echo ""
	@echo "🏭 Produção:"
	@echo "  make prod             - Inicia ambiente de produção (com backend REAL)"
	@echo "  make prod-mock        - Inicia ambiente de produção (com backend MOCK)"
	@echo "  make prod-logs        - Mostra logs do ambiente de produção"
	@echo "  make prod-mock-logs   - Mostra logs do ambiente de produção com mock"
	@echo ""
	@echo "🧪 Testes:"
	@echo "  make test             - Executa testes automatizados"
	@echo ""
	@echo "🔧 Gerenciamento:"
	@echo "  make build            - Faz build das imagens Docker"
	@echo "  make clean            - Remove containers, imagens e volumes"
	@echo "  make stop             - Para todos os containers"
	@echo "  make restart          - Reinicia ambiente atual"
	@echo "  make health           - Verifica saúde dos containers"
	@echo "  make shell-dev        - Acessa shell do container de desenvolvimento"
	@echo ""
	@echo "📡 Informações de Rede:"
	@echo "  Backend Real:  Rede 'microservices-network' (container: backend)"
	@echo "  Backend Mock:  Porta 8081 (http://localhost:8081)"
	@echo "  Frontend Dev:  Porta 4200 (http://localhost:4200)"
	@echo "  Frontend Mock: Porta 4201 (http://localhost:4201)"
	@echo ""

# Desenvolvimento com Backend Real
dev:
	@echo "🚀 Iniciando ambiente de desenvolvimento com BACKEND REAL..."
	@echo "📡 Conectando à rede 'microservices-network' existente..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d frontend-dev
	@echo "✅ Ambiente disponível em: http://localhost:4200"
	@echo "🔗 Conectado ao backend real na rede 'microservices-network'"

# Desenvolvimento com Backend Mock
dev-mock:
	@echo "🚀 Iniciando ambiente de desenvolvimento com BACKEND MOCK..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock up -d frontend-dev-mock backend-mock
	@echo "✅ Frontend disponível em: http://localhost:4201"
	@echo "🎭 Backend mock disponível em: http://localhost:8081"

dev-logs:
	@echo "📋 Logs do ambiente de desenvolvimento (backend real):"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f frontend-dev

dev-mock-logs:
	@echo "📋 Logs do ambiente de desenvolvimento (backend mock):"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock logs -f frontend-dev-mock backend-mock

# Produção com Backend Real
prod:
	@echo "🏭 Iniciando ambiente de produção com BACKEND REAL..."
	@echo "📡 Conectando à rede 'microservices-network' existente..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d frontend-prod
	@echo "✅ Ambiente disponível em: http://localhost"
	@echo "🔗 Conectado ao backend real na rede 'microservices-network'"

# Produção com Backend Mock
prod-mock:
	@echo "🏭 Iniciando ambiente de produção com BACKEND MOCK..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock up -d frontend-prod-mock backend-mock
	@echo "✅ Frontend disponível em: http://localhost:8080"
	@echo "🎭 Backend mock disponível em: http://localhost:8081"

prod-logs:
	@echo "📋 Logs do ambiente de produção (backend real):"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f frontend-prod

prod-mock-logs:
	@echo "📋 Logs do ambiente de produção (backend mock):"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock logs -f frontend-prod-mock backend-mock

# Testes
test:
	@echo "🧪 Executando testes automatizados..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile testing run --rm frontend-test

# Build
build:
	@echo "🔨 Fazendo build das imagens Docker..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache

build-dev:
	@echo "🔨 Build apenas para desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build frontend-dev frontend-dev-mock

build-prod:
	@echo "🔨 Build apenas para produção..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build frontend-prod frontend-prod-mock

# Gerenciamento
stop:
	@echo "🛑 Parando todos os containers..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock down

stop-dev:
	@echo "🛑 Parando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) stop frontend-dev

stop-dev-mock:
	@echo "🛑 Parando ambiente de desenvolvimento mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock stop frontend-dev-mock backend-mock

stop-prod:
	@echo "🛑 Parando ambiente de produção..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) stop frontend-prod

stop-prod-mock:
	@echo "🛑 Parando ambiente de produção mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock stop frontend-prod-mock backend-mock

clean:
	@echo "🧹 Limpando containers, imagens e volumes..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --rmi all
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock down -v --rmi all
	docker system prune -f

restart:
	@echo "🔄 Reiniciando ambiente..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock restart

restart-dev:
	@echo "🔄 Reiniciando ambiente de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart frontend-dev

restart-dev-mock:
	@echo "🔄 Reiniciando ambiente de desenvolvimento mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock restart frontend-dev-mock backend-mock

restart-prod:
	@echo "🔄 Reiniciando ambiente de produção..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart frontend-prod

restart-prod-mock:
	@echo "🔄 Reiniciando ambiente de produção mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock restart frontend-prod-mock backend-mock

# Health check
health:
	@echo "🏥 Verificando saúde dos containers..."
	@echo "📊 Containers ativos:"
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) ps
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock ps
	@echo ""
	@echo "📊 Status detalhado:"
	docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep finances || echo "Nenhum container do FinancesK rodando"

# Shell access
shell-dev:
	@echo "🐚 Acessando shell do container de desenvolvimento..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev sh

shell-dev-mock:
	@echo "🐚 Acessando shell do container de desenvolvimento mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock exec frontend-dev-mock sh

shell-prod:
	@echo "🐚 Acessando shell do container de produção..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-prod sh

shell-prod-mock:
	@echo "🐚 Acessando shell do container de produção mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock exec frontend-prod-mock sh

shell-backend-mock:
	@echo "🐚 Acessando shell do backend mock..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock exec backend-mock sh

# Monitoramento (quando disponível)
monitoring:
	@echo "📊 Iniciando stack de monitoramento..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile monitoring up -d
	@echo "✅ Grafana disponível em: http://localhost:3000"
	@echo "✅ Prometheus disponível em: http://localhost:9090"

# Load balancer para produção
lb:
	@echo "⚖️ Iniciando load balancer..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile load-balancer up -d
	@echo "✅ Load balancer disponível em: http://localhost:8443"

# Comandos de desenvolvimento úteis
npm-install:
	@echo "📦 Instalando dependências npm..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev npm install

npm-install-mock:
	@echo "📦 Instalando dependências npm (mock)..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile mock exec frontend-dev-mock npm install

npm-update:
	@echo "📦 Atualizando dependências npm..."
	docker compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev npm update

# Verificação de rede
network-info:
	@echo "🌐 Informações de rede:"
	@echo ""
	@echo "📡 Rede microservices-network (backend real):"
	docker network inspect microservices-network --format='{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || echo "Rede microservices-network não encontrada"
	@echo ""
	@echo "📡 Rede finances-network (backend mock):"
	docker network inspect financesK_finances-network --format='{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || echo "Rede finances-network não encontrada"

# Backup e restore
backup:
	@echo "💾 Criando backup dos volumes..."
	docker run --rm -v $(PROJECT_NAME)_node_modules:/data -v $(PWD)/backups:/backup alpine tar czf /backup/node_modules_$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Default target
.DEFAULT_GOAL := help
