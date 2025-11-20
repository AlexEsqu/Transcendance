# **************************************************************************** #
#		General variables													   #
# **************************************************************************** #

NAME				=	Transcendence

SRC_DIR				=	src
OBJ_DIR				=	obj
INC_DIR				=	inc
WEB_DIR				=	pages

USER := $(shell whoami)
BACKEND_DIR := /home/$(USER)/transcendence/data/Backend

all: build up

dev:
	mkdir -p $(BACKEND_DIR)
	docker compose -f ./docker-compose.dev.yml build
	docker compose -f ./docker-compose.dev.yml up

build:
	mkdir -p $(BACKEND_DIR)
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up

down:
	docker compose -f ./docker-compose.yml down -v

clean:
	docker volume rm backend -f
	

fclean:
	docker system prune -af
	rm -rf $(BACKEND_DIR)

re: fclean build up
