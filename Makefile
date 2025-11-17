# **************************************************************************** #
#		General variables													   #
# **************************************************************************** #

NAME				=	Transcendence

SRC_DIR				=	src
OBJ_DIR				=	obj
INC_DIR				=	inc
WEB_DIR				=	pages


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
