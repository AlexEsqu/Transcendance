# **************************************************************************** #
#		General variables													   #
# **************************************************************************** #

NAME				=	transcendant

SRC_DIR				=	src
# OBJ_DIR				=	obj
# INC_DIR				=	inc
WEB_DIR				=	pages
DOC_DIR				=	docker

#----- SOURCE FILE FOLDERS ----------------------------------------------------#

DIR_HOME			=	homepage

#----- SOURCE FILES -----------------------------------------------------------#

FUNC_HOME			=	hello.ts

FUNC				=	$(addprefix $(DIR_HOME)/, $(FUNC_HOME))

SUBDIR				=	$(DIR_HOME)

SRC					=	$(addprefix $(SRC_DIR)/, $(FUNC))

# OBJ_DIRS			= 	$(OBJ_DIR) \
# 						$(addprefix $(OBJ_DIR)/, $(SUBDIR)) \

#----- HEADER FILES -----------------------------------------------------------#

# HEAD_DIR			=	$(addprefix $(INC_DIR)/, $(SUBDIR))

#----- COMPILATION VARIABLES --------------------------------------------------#

# INC					=	$(addprefix -I, $(HEAD_DIR)) -I$(INC_DIR)

# DEP					=	$(OBJ_DIRS) $(HEADER)

# **************************************************************************** #
#		Testing variables													   #
# **************************************************************************** #

# TEST_DIR			=	tests
# DEBUG_FLAG			=	-g -fno-limit-debug-info

# #------ Integration Test ------------------------------------------------------#




# #------ Unit Test -------------------------------------------------------------#

# UNIT_TEST_DIR		=	$(TEST_DIR)/unittest





# UNIT_TEST_BIN		=	utest_$(NAME)

# #------ Valgrind --------------------------------------------------------------#

# V_FLAG				= valgrind --leak-check=full --show-leak-kinds=all \
# 						--track-origins=yes --track-fds=yes \
# 						--trace-children=yes

# **************************************************************************** #
#		Server																   #
# **************************************************************************** #

all:				$(NAME)

$(NAME):			# $(OBJ_DIRS)
					cd typescript && npx tsc
# 					mkdir -p babylon && cd babylon
					npm install --save-dev @babylonjs/core
					npm install --save-dev @babylonjs/inspector
					tsc --init
					npm install --save-dev webpack ts-loader webpack-cli
					npm install --save-dev html-webpack-plugin
					npm install --save-dev webpack-dev-server

# $(OBJ_DIRS):
# 					mkdir -p $(OBJ_DIRS)

# **************************************************************************** #
#		Testing																   #
# **************************************************************************** #

nginx:
					make -C $(NGINX_DOCK)
					@echo "Connect on http://localhost:8080"

# test:				$(TMP_DIR)
# 					$(CC) $(DEBUG_FLAG) -I$(UNIT_TEST_FRAME) $(INC) -o $(UNIT_TEST_BIN) $(UNIT_TEST_SRC) $(SRC_NO_MAIN)
# 					./utest_webserv -ni -nv

# **************************************************************************** #
#		Debug																   #
# **************************************************************************** #

# debug:				$(TMP_DIR)
# 					@echo "Compiling with debug flag"
# 					$(CC) $(FLAGS) $(DEBUG_FLAG)  $(INC) -o $(NAME) $(SRC)

# verbose:			$(TMP_DIR)
# 					@echo "Compiling with additional logging info"
# 					$(CC) $(FLAGS) -D DEBUG $(DEBUG_FLAG) $(INC) -o $(NAME) $(SRC)

# valgrind:
# 					make debug
# 					$(V_FLAG) ./webserv confs/basic.conf

# **************************************************************************** #
#		Clean up															   #
# **************************************************************************** #

clean:
					rm -rf $(OBJ_DIR)

fclean:
					make clean
					rm -rf $(NAME)

re:					fclean all

.PHONY:				all clean fclean re debug verbose $(CCLIENT_NAME)
