# **************************************************************************** #
#		General variables													   #
# **************************************************************************** #

NAME				=	Transcendence

SRC_DIR				=	src
OBJ_DIR				=	obj
INC_DIR				=	inc
WEB_DIR				=	pages

FRONT_SERVICES		=	typescript
BACK_SERVICES		=	fastify
REVERSE_PROXY		=	nginx

USER := $(shell whoami)
CERT_DIR := ./nginx/certs
CERT_KEY := $(CERT_DIR)/server.key
CERT_CRT := $(CERT_DIR)/server.crt
CERT_DAYS := 365
CERT_CN := localhost

all: build up

certs:
	@mkdir -p $(CERT_DIR)
	@if [ ! -f "$(CERT_KEY)" ] || [ ! -f "$(CERT_CRT)" ]; then \
		echo "Generating self-signed SSL certificate..."; \
		openssl req -x509 -nodes -newkey rsa:4096 \
			-days $(CERT_DAYS) \
			-keyout $(CERT_KEY) \
			-out $(CERT_CRT) \
			-subj "/C=FR/ST=IDF/L=Paris/O=Dev/OU=Dev/CN=$(CERT_CN)"; \
		echo "Certificate created in $(CERT_DIR)"; \
	else \
		echo "Certificate already exists, skipping."; \
	fi

dev:
	docker compose -f ./docker-compose.dev.yml build
	docker compose -f ./docker-compose.dev.yml up

build: certs
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up

down:
	docker compose -f ./docker-compose.yml down -v

clean:
	docker compose -f ./docker-compose.yml down --volumes --remove-orphans
	docker volume rm backend -f

front:
	docker compose -f ./docker-compose.dev.yml build ${FRONT_SERVICES}
	docker compose -f ./docker-compose.dev.yml up ${FRONT_SERVICES}

front_up:
	docker compose -f ./docker-compose.dev.yml up ${FRONT_SERVICES}

front_down:
	docker compose -f ./docker-compose.dev.yml down ${FRONT_SERVICES}

back:
	docker compose -f ./docker-compose.dev.yml build ${BACK_SERVICES}
	docker compose -f ./docker-compose.dev.yml up ${BACK_SERVICES}

back_up:
	docker compose -f ./docker-compose.dev.yml up ${BACK_SERVICES}

back_down:
	docker compose -f ./docker-compose.dev.yml down ${BACK_SERVICES}

fclean:
	docker system prune -af
	docker volume prune -af

tests:
	docker exec -it fastify npm run test

re: fclean build up

.PHONY: certs

