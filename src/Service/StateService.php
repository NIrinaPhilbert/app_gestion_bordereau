<?php

namespace App\Service;

class StateService
{
    private $security;
    private $params;

    public function __construct($security, $params)
    {
        $this->security = $security;
        $this->params = $params;
    }

    public function checkState()
    {
        if (null === $this->security->getUser()) {
            return array(
                'success' => false,
                'isLogged' => false,
                'message' => $this->params->get('message.must_logged')
            );
        } else {
            return array(
                'success' => true,
                'isLogged' => true,
                'message' => $this->params->get('message.must_admin')
            );
        }
        return array(
            'success' => true,
            'isLogged' => true,
            'message' => ''
        );
    }
}