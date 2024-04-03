# 1. Load the variables from vars.sh.
# 2. Add the ssh key pair to the authentication agent.
# 3. Upload the provision.sh and vars.sh file to the server.
# 4. Run the provision.sh file on the server.
# scp is a command to copy files between hosts. It uses ssh for data transfer and provides the same authentication and security as ssh.
# ssh-add adds private key identities to the authentication agent, ssh-agent.
# ssh is a command to connect to a remote server using the ssh protocol.

source vars.sh
ssh-add $SSH_KEY_PATH
scp provision.sh vars.sh $USER@$HOST:
ssh $USER@$HOST "chmod +x provision.sh && ./provision.sh"
