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

#----- SOURCE FILES -----------------------------------------------------------#

#----- SOURCE FILE SUBFOLDERS -------------------------------------------------#

#----- HEADER FILES -----------------------------------------------------------#


# **************************************************************************** #
#		Compilation variables												   #
# **************************************************************************** #

# **************************************************************************** #
#		Testing variables													   #
# **************************************************************************** #


# **************************************************************************** #
#		Javascript															   #
# **************************************************************************** #


all:		$(NAME)


$(NAME):
			cd /tmp/Trans/docker/typescript \
			&& docker build -t typescript . \
			&& docker run --rm -p 8080:8080 typescript

clean:
			docker system prune -af \
			&& docker volume prune -f \
			&& docker ps -a --filter ancestor=typescript -q | xargs -r docker rm -f

fclean:
			docker system prune -af \
			&& docker volume prune -f \
			&& docker rmi typescript

re:			fclean all

# **************************************************************************** #
#		Backend 															   #
# **************************************************************************** #

# all: build up

# dev:
# 	mkdir -p $(BACKEND_DIR)
# 	docker compose -f ./docker-compose.dev.yml build
# 	docker compose -f ./docker-compose.dev.yml up

# build:
# 	mkdir -p $(BACKEND_DIR)
# 	docker compose -f ./docker-compose.yml build

# up:
# 	docker compose -f ./docker-compose.yml up

# down:
# 	docker compose -f ./docker-compose.yml down -v

# clean:
# 	docker volume rm backend -f
	

# fclean:
# 	docker system prune -af
# 	sudo rm -rf $(BACKEND_DIR)

# re: fclean build up
