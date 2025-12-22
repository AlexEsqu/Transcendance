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

all: build up

dev:
	docker compose -f ./docker-compose.dev.yml build
	docker compose -f ./docker-compose.dev.yml up

build:
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
