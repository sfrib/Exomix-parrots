<?php
// Test fixture: equivalent code written safely; RepoGuard should report nothing.
add_action( 'wp_ajax_delete_bird', 'rg_delete_bird' );
function rg_delete_bird() {
    check_ajax_referer( 'rg_delete_bird' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( 'Forbidden', 403 );
    }
    global $wpdb;
    $id = absint( $_POST['id'] );
    $wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->prefix}birds WHERE id = %d", $id ) );
    wp_send_json_success();
}

function rg_search() {
    global $wpdb;
    $name = sanitize_text_field( wp_unslash( $_GET['q'] ) );
    $sql  = $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}birds WHERE name LIKE %s", '%' . $wpdb->esc_like( $name ) . '%' );
    return $wpdb->get_results( $sql );
}

if ( isset( $_POST['action'] ) && $_POST['action'] === 'save' ) {
    echo esc_html( sanitize_text_field( wp_unslash( $_GET['q'] ) ) );
}

$count = (int) $_GET['count'];

register_rest_route( 'registry/v1', '/birds', array(
    'methods'             => 'GET',
    'callback'            => 'rg_rest_list',
    'permission_callback' => '__return_true',
) );

define( 'DB_PASSWORD', getenv( 'DB_PASSWORD' ) );
$token = bin2hex( random_bytes( 32 ) );
