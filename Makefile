# =============================================================================
# Makefile para FinancesK Frontend - Comandos Docker simplificados
# =============================================================================

.PHONY: help dev prod test build clean logs stop restart health

# Variáveis
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = financesK

# Help - mostra comandos disponíveis
help:
	@echo "FinancesK Frontend - Comandos Docker Disponíveis:"
	@echo ""
	@echo "🚀 Desenvolvimento:"
	@echo "  make dev          - Inicia ambiente de desenvolvimento (com hot-reload)"
	@echo "  make dev-logs     - Mostra logs do ambiente de desenvolvimento"
	@echo ""
	@echo "🏭 Produção:"
	@echo "  make prod         - Inicia ambiente de produção"
	@echo "  make prod-logs    - Mostra logs do ambiente de produção"
	@echo ""
	@echo "🧪 Testes:"
	@echo "  make test         - Executa testes automatizados"
	@echo ""
	@echo "🔧 Gerenciamento:"
	@echo "  make build        - Faz build das imagens Docker"
	@echo "  make clean        - Remove containers, imagens e volumes"
	@echo "  make stop         - Para todos os containers"
	@echo "  make restart      - Reinicia ambiente atual"
	@echo "  make health       - Verifica saúde dos containers"
	@echo "  make shell-dev    - Acessa shell do container de desenvolvimento"
	@echo ""

# Desenvolvimento
dev:
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d frontend-dev backend
	@echo "✅ Ambiente disponível em: http://localhost:4200"

dev-logs:
	@echo "📋 Logs do ambiente de desenvolvimento:"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f frontend-dev

# Produção
prod:
	@echo "🏭 Iniciando ambiente de produção..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d frontend-prod backend
	@echo "✅ Ambiente disponível em: http://localhost"

prod-logs:
	@echo "📋 Logs do ambiente de produção:"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f frontend-prod

# Testes
test:
	@echo "🧪 Executando testes automatizados..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile testing run --rm frontend-test

# Build
build:
	@echo "🔨 Fazendo build das imagens Docker..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache

build-dev:
	@echo "🔨 Build apenas para desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build frontend-dev

build-prod:
	@echo "🔨 Build apenas para produção..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build frontend-prod

# Gerenciamento
stop:
	@echo "🛑 Parando todos os containers..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down

clean:
	@echo "🧹 Limpando containers, imagens e volumes..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --rmi all
	docker system prune -f

restart:
	@echo "🔄 Reiniciando ambiente..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart

restart-dev:
	@echo "🔄 Reiniciando ambiente de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart frontend-dev

restart-prod:
	@echo "🔄 Reiniciando ambiente de produção..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart frontend-prod

# Health check
health:
	@echo "🏥 Verificando saúde dos containers..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) ps
	@echo ""
	@echo "📊 Status detalhado:"
	docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Shell access
shell-dev:
	@echo "🐚 Acessando shell do container de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev sh

shell-prod:
	@echo "🐚 Acessando shell do container de produção..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-prod sh

# Monitoramento (quando disponível)
monitoring:
	@echo "📊 Iniciando stack de monitoramento..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile monitoring up -d
	@echo "✅ Grafana disponível em: http://localhost:3000"
	@echo "✅ Prometheus disponível em: http://localhost:9090"

# Load balancer para produção
lb:
	@echo "⚖️ Iniciando load balancer..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) --profile load-balancer up -d
	@echo "✅ Load balancer disponível em: http://localhost:8443"

# Comandos de desenvolvimento úteis
npm-install:
	@echo "📦 Instalando dependências npm..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev npm install

npm-update:
	@echo "📦 Atualizando dependências npm..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec frontend-dev npm update

# Backup e restore
backup:
	@echo "💾 Criando backup dos volumes..."
	docker run --rm -v $(PROJECT_NAME)_node_modules:/data -v $(PWD)/backups:/backup alpine tar czf /backup/node_modules_$(shell date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Default target
.DEFAULT_GOAL := help
