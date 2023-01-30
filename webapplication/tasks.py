import os
import threading
import time

from invoke import task


def wait_port_is_open(host, port):
    import socket
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                return
        except socket.gaierror:
            pass
        time.sleep(1)


@task
def devcron(ctx, crontab_name='crontab'):
    ctx.run(f'python -m devcron {crontab_name}')


@task
def init_db(ctx, recreate_db=False):
    wait_port_is_open(os.getenv('POSTGRES_HOST', 'db'), 5432)
    if recreate_db:
        ctx.run('python -m manage dbshell < clear.sql')
        ctx.run('python -m manage dbshell < ./db.dump')
    ctx.run('python -m manage makemigrations')
    ctx.run('python -m manage migrate')


@task
def collect_static_element(ctx):
    ctx.run('python -m manage collectstatic --noinput')


@task
def run_notebook_executor(ctx):
    ctx.run('python -m manage notebook_executor')

@task
def run(ctx):
    init_db(ctx, recreate_db=True)
    collect_static_element(ctx)
    run_aux_threads(ctx)
    ctx.run('uwsgi --ini uwsgi.ini')

@task
def run_prod(ctx):
    init_db(ctx)
    collect_static_element(ctx)
    run_aux_threads(ctx)
    ctx.run('uwsgi --ini uwsgi.ini')

@task
def run_notebook_executor_k8s(ctx):
    wait_port_is_open(os.getenv('POSTGRES_HOST', 'db'), 5432)
    ctx.run('python -m manage notebooks_executor_k8s')

@task
def run_publisher_k8s(ctx):
    wait_port_is_open(os.getenv('POSTGRES_HOST', 'db'), 5432)
    ctx.run('python -m manage publisher_k8s')

@task
def run_notificator(ctx):
    wait_port_is_open(os.getenv('POSTGRES_HOST', 'db'), 5432)
    ctx.run('python -m manage notify')

@task
def test(ctx):
    wait_port_is_open(os.getenv('POSTGRES_HOST', 'db'), 5432)
    ctx.run('python -m manage test')

def run_aux_threads(ctx):
    
    thread_cron = threading.Thread(target=devcron, args=(ctx,))
    thread_cron.start()

    thread_nb_executor = threading.Thread(target=run_notebook_executor, args=(ctx,))
    thread_nb_executor.start()

    thread_notificator = threading.Thread(target=run_notificator, args=(ctx,))
    thread_notificator.start()
