all: build up

build: 
	mkdir -p /home/${USER}/transcendence/data/Backend
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up

down:	
	docker compose -f ./docker-compose.yml down -v

clean: 
	docker volume rm backend -f

fclean:
	docker system prune -af
	sudo rm /home/${USER}/transcendence/data/Backend -rf
	
re : fclean build up