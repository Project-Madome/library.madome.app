if [ "$(git branch --show-current)" = "beta" ] || [ "$(git branch --show-current)" = "stable" ]; then
    kubectl apply -f k8s_cluster_ip.yml

    if [ $? -ne 0 ]; then
        exit 1
    fi

    # ORM_CONFIG=ormconfig.json
    NODE_ENV=production
else
    kubectl apply -f k8s_node_port.yml

    if [ $? -ne 0 ]; then
        exit 1
    fi

    # ORM_CONFIG=ormconfig.development.json
    NODE_ENV=development
fi

docker build -t "madome-library:latest" .

if [ $? -ne 0 ]; then
    exit 1
fi

# POSTGRES_HOST="$(cat .env | grep "POSTGRES_HOST" | sed -e 's/POSTGRES_HOST=//')"

cat k8s_deployment.yml | \
# sed -e "s%{WORK_DIR}%$PWD%g" | \
# sed -e "s%{ORM_CONFIG}%$ORM_CONFIG%" | \
# sed -e "s%{NODE_ENV}%$NODE_ENV%" | \
# sed -e "s%{POSTGRES_HOST}%$POSTGRES_HOST%" | \
kubectl apply -f -

if [ $? -ne 0 ]; then
    exit 1
fi

if [ "$1" = "minikube" ]; then
    echo "minikube image load"
    minikube image load madome-library:latest

    if [ $? -ne 0 ]; then
        echo "fail"
        exit 1
    fi
fi

kubectl rollout restart deployment/madome-library
