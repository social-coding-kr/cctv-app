import socket

host = ''
port = 9030
backlog = 5
size = 10240
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((host,port))
s.listen(backlog)
while 1:
    client, address = s.accept()
    while 1:
        data = client.recv(size)
        if data or len(data) > 0:
            client.send(data)
            print(data)
        else:
            client.close()
            print('----- NO MORE DATA -----')
            break