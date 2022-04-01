SVC=library
VERSION="$(cat package.json | grep '"version": ' | head -1 | sed -e "s/ //g" | sed -e 's/\"//g' | sed -e 's/version://g' | sed -e 's/,//g')"

if [ "$(git branch --show-current)" = "beta" ] || [ "$(git branch --show-current)" = "stable" ]; then
    kubectl apply -f k8s_cluster_ip.yml

    if [ $? -ne 0 ]; then
        exit 1
    fi

    # ORM_CONFIG=ormconfig.json
    NODE_ENV=production

    if [ "$CURRENT_BRANCH" = "beta" ]; then
        # e.g. 0.1.1-beta
        VERSION="$VERSION-$CURRENT_BRANCH"
    else
        # e.g. 0.1.1
        VERSION="$VERSION"
    fi
else
    kubectl apply -f k8s_node_port.yml

    if [ $? -ne 0 ]; then
        exit 1
    fi

    # ORM_CONFIG=ormconfig.development.json
    NODE_ENV=development
    VERSION=latest

    docker build -t "madome/$SVC:$VERSION" .

    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

cat k8s_deployment.yml | \
sed -e "s/{VERSION}/$VERSION/g" | \
kubectl apply -f -

if [ $? -ne 0 ]; then
    exit 1
fi

# if [ "$1" = "minikube" ]; then
#     echo "minikube image load"
#     minikube image load madome-$SVC:$VERSION
# 
#     if [ $? -ne 0 ]; then
#         echo "fail"
#         exit 1
#     fi
# fi

if [ "$CURRENT_BRANCH" != "stable" ]; then
    kubectl rollout restart deployment/madome-$SVC
fi
