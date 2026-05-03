COMPOSE := docker compose -f docker-compose.prod.yml
PUBLIC_COMPOSE := docker compose -f docker-compose.prod.yml -f docker-compose.quicktunnel.yml
PROD_SERVICES := db adminer backend frontend admin-frontend
BUILD_SERVICES := backend frontend admin-frontend
PUBLIC_SERVICES := cloudflared-quick-backend cloudflared-quick-user cloudflared-quick-admin

.DEFAULT_GOAL := help

.PHONY: help prod prod-up prod-build prod-down prod-stop prod-restart prod-logs prod-ps \
	prod-db prod-be prod-fe-user prod-fe-admin db be fe-user fe-admin \
	public public-up public-down public-stop public-restart public-logs public-ps \
	cloudflare cloudflare-up cloudflare-down cloudflare-logs public-ip-free

help:
	@printf '%s\n' 'Production targets:'
	@printf '  %-18s %s\n' 'make prod' 'Build va chay prod stack: DB, BE, FE user, FE admin'
	@printf '  %-18s %s\n' 'make prod-up' 'Nhu make prod'
	@printf '  %-18s %s\n' 'make prod-build' 'Build image prod'
	@printf '  %-18s %s\n' 'make prod-down' 'Tat va xoa container prod stack'
	@printf '  %-18s %s\n' 'make prod-stop' 'Stop container prod stack'
	@printf '  %-18s %s\n' 'make prod-restart' 'Restart prod stack'
	@printf '  %-18s %s\n' 'make prod-logs' 'Xem log prod stack'
	@printf '  %-18s %s\n' 'make prod-ps' 'Xem trang thai container'
	@printf '  %-18s %s\n' 'make prod-db' 'Chay rieng DB'
	@printf '  %-18s %s\n' 'make prod-be' 'Chay rieng backend'
	@printf '  %-18s %s\n' 'make prod-fe-user' 'Chay rieng frontend user'
	@printf '  %-18s %s\n' 'make prod-fe-admin' 'Chay rieng frontend admin'
	@printf '%s\n' ''
	@printf '%s\n' 'Cloudflare Quick Tunnel targets:'
	@printf '  %-18s %s\n' 'make public' 'Build va chay Cloudflare free public URL o background'
	@printf '  %-18s %s\n' 'make public-up' 'Build va chay Cloudflare free public URL o background'
	@printf '  %-18s %s\n' 'make public-logs' 'Xem URL trycloudflare.com trong logs'
	@printf '  %-18s %s\n' 'make public-down' 'Tat stack public tunnel'

prod prod-up:
	$(COMPOSE) up --build -d $(PROD_SERVICES)

prod-build:
	$(COMPOSE) build $(BUILD_SERVICES)

prod-down:
	$(COMPOSE) down

prod-stop:
	$(COMPOSE) stop $(PROD_SERVICES)

prod-restart: prod-down prod-up

prod-logs:
	$(COMPOSE) logs -f $(PROD_SERVICES)

prod-ps:
	$(COMPOSE) ps

prod-db db:
	$(COMPOSE) up -d db

prod-be be:
	$(COMPOSE) up --build -d db backend

prod-fe-user fe-user:
	$(COMPOSE) up --build -d db backend frontend

prod-fe-admin fe-admin:
	$(COMPOSE) up --build -d db backend admin-frontend

public cloudflare public-ip-free:
	$(PUBLIC_COMPOSE) up --no-deps -d $(PUBLIC_SERVICES)

public-up cloudflare-up:
	$(PUBLIC_COMPOSE) up --no-deps -d $(PUBLIC_SERVICES)

public-down cloudflare-down:
	$(PUBLIC_COMPOSE) rm -f -s -v $(PUBLIC_SERVICES)

public-stop:
	$(PUBLIC_COMPOSE) stop $(PUBLIC_SERVICES)

public-restart: public-down public-up

public-logs cloudflare-logs:
	$(PUBLIC_COMPOSE) logs -f cloudflared-quick-backend cloudflared-quick-user cloudflared-quick-admin

public-ps:
	$(PUBLIC_COMPOSE) ps
