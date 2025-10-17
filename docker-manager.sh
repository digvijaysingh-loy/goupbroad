#!/bin/bash

PROJECT_NAME=${1:-"myproject"}
IMAGE_PREFIX="$PROJECT_NAME"
MONGO_VOLUME="${PROJECT_NAME}_mongo-data"
NETWORK_NAME="${PROJECT_NAME}-net"

check_env_files() {
    local env=$1
    if [ "$env" == "development" ]; then
        if [ ! -f .env.development ]; then
            echo "❌ Error: .env.development file not found! Please create this file."
            exit 1
        fi
        if [ ! -f docker-compose.dev.yml ]; then
            echo "❌ Error: docker-compose.dev.yml file not found! Please create this file."
            exit 1
        fi
    elif [ "$env" == "production" ]; then
        if [ ! -f .env.production ]; then
            echo "❌ Error: .env.production file not found! Please create this file."
            exit 1
        fi
        if [ ! -f docker-compose.prod.yml ]; then
            echo "❌ Error: docker-compose.prod.yml file not found! Please create this file."
            exit 1
        fi
    fi
}

# Function to clean up containers, images, volumes, and network
cleanup() {
    local env=$1
    echo "🧹 Starting cleanup process for $PROJECT_NAME ($env environment)..."

    docker stop mongo_container client server >/dev/null 2>&1
    docker rm mongo_container client server >/dev/null 2>&1

    docker rmi $(docker images -q --filter "reference=${IMAGE_PREFIX}*") >/dev/null 2>&1

    docker volume rm $MONGO_VOLUME >/dev/null 2>&1
    docker network rm $NETWORK_NAME >/dev/null 2>&1

    echo "✅ Cleanup complete."
}

# Function for complete teardown - stops all containers and removes all resources
complete_teardown() {
    echo "💥 Performing complete teardown for $PROJECT_NAME..."
    
    if [ -f docker-compose.dev.yml ]; then
        echo "🛑 Stopping development containers..."
        docker compose --project-name $PROJECT_NAME -f docker-compose.dev.yml down -v
    fi
    
    if [ -f docker-compose.prod.yml ]; then
        echo "🛑 Stopping production containers..."
        docker compose --project-name $PROJECT_NAME -f docker-compose.prod.yml down -v
    fi
    
    echo "🗑️ Removing any remaining containers..."
    docker rm -f $(docker ps -a -q --filter name=${PROJECT_NAME}) >/dev/null 2>&1

    echo "📦 Removing project images..."
    docker rmi $(docker images -q --filter "reference=${IMAGE_PREFIX}*") >/dev/null 2>&1

    echo "🧊 Removing project volumes..."
    docker volume rm $(docker volume ls -q --filter name=${PROJECT_NAME}) >/dev/null 2>&1

    echo "🌐 Removing project network..."
    docker network rm $NETWORK_NAME >/dev/null 2>&1

    echo "✅ Complete teardown finished. All containers, images, volumes, and networks for $PROJECT_NAME have been removed."
}

# Function to start services
start_services() {
    local env=$1
    local services=$2

    echo "🚀 Starting services in $env environment..."
    if [ "$env" == "development" ]; then
        docker compose --project-name $PROJECT_NAME --env-file .env.development -f docker-compose.dev.yml up $services
    else
        docker compose --project-name $PROJECT_NAME --env-file .env.production -f docker-compose.prod.yml up -d $services
    fi
}

# Interactive menu function
show_menu() {
    echo "🌍 Select Environment:"
    echo "1) 🛠️ Development"
    echo "2) 🚢 Production"
    echo "3) 🔥 Complete Teardown (all environments)"
    echo "4) ❌ Exit"
    read -p "Choice [1-4]: " env_choice

    case $env_choice in
    1) ENV="development" ;;
    2) ENV="production" ;;
    3) 
        complete_teardown
        exit 0
        ;;
    4) exit 0 ;;
    *)
        echo "⚠️ Invalid choice"
        return 1
        ;;
    esac

    check_env_files $ENV

    echo "🧩 Select Service:"
    echo "1) 🔄 All (Clean start)"
    echo "2) 🖥️ Server"
    echo "3) 🌐 Client"
    echo "4) 🔗 Server & Client"
    echo "5) 🔙 Back"
    echo "6) ❌ Exit"
    read -p "Choice [1-6]: " service_choice

    return 0
}

# Main script logic
if [ $# -eq 0 ]; then
    echo "ℹ️  Usage: ./setup.sh <project_name>"
    echo "⚠️  No project name provided, using default: $PROJECT_NAME"
fi

while true; do
    show_menu
    [ $? -eq 1 ] && continue

    case $service_choice in
    1)
        cleanup $ENV
        start_services $ENV "--build --force-recreate"
        ;;
    2) start_services $ENV "server" ;;
    3) start_services $ENV "client" ;;
    4) start_services $ENV "server client" ;;
    5) continue ;;
    6) exit 0 ;;
    *) echo "⚠️ Invalid choice" ;;
    esac
    break
done
