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

USER := $(shell whoami)
BACKEND_DIR := ./data/Backend

all: build up

dev:
	mkdir -p $(BACKEND_DIR)
	docker compose -f ./docker-compose.dev.yml build
	docker

build:
	mkdir -p $(BACKEND_DIR)
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up

down:
	docker compose -f ./docker-compose.yml down -v

clean:
	docker compose -f ./docker-compose.yml down --volume --remove-orphans
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
	docker volume prune -f
	rm -rf $(BACKEND_DIR)

re: fclean build up
